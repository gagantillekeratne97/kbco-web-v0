"use client";
import { useEffect, useRef, useState } from "react";
import {
    HubConnection,
    HubConnectionBuilder,
    HubConnectionState,
} from "@microsoft/signalr";

type Notification = {
    title: string;
    message: string;
    creditNoteNumber: string;
    createdAt: string;
};

export default function SignalRTestPage() {
    const [status, setStatus] = useState("Disconnected");
    const [userCode, setUserCode] = useState("");
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const connectionRef = useRef<HubConnection | null>(null);

    useEffect(() => {
        debugger;
        let isMounted = true;
        let connection: HubConnection | null = null;

        const startConnection = async () => {
            const token = sessionStorage.getItem("token");

            if (!token) {
                if (isMounted) {
                    setStatus("JWT token not found");
                }
                return;
            }

            connection = new HubConnectionBuilder()
                .withUrl("https://localhost:7136/hubs/creditnotes", {
                    accessTokenFactory: () => token,
                })
                .withAutomaticReconnect()
                .build();

            connectionRef.current = connection;

            // Listen for notifications sent by the API.
            connection.on(
                "ReceiveNotification",
                (notification: Notification) => {
                    if (!isMounted) return;

                    setNotifications((previous) => [
                        notification,
                        ...previous,
                    ]);
                }
            );

            connection.onreconnecting(() => {
                if (isMounted) setStatus("Reconnecting...");
            });

            connection.onreconnected(async () => {
                if (!isMounted) return;

                setStatus("Connected");

                try {
                    const code = await connection!.invoke<string>(
                        "GetUserCode"
                    );

                    if (isMounted) setUserCode(code);
                } catch (error) {
                    console.error("Could not retrieve user code:", error);
                }
            });

            connection.onclose(() => {
                if (isMounted) setStatus("Disconnected");
            });

            try {
                await connection.start();

                if (!isMounted) return;

                setStatus("Connected");

                const code = await connection.invoke<string>(
                    "GetUserCode"
                );

                if (isMounted) setUserCode(code);
            } catch (error) {
                console.error("SignalR connection failed:", error);

                if (isMounted) {
                    setStatus("Connection failed");
                }
            }
        };

        void startConnection();

        return () => {
            isMounted = false;
            connectionRef.current = null;

            if (
                connection &&
                connection.state !== HubConnectionState.Disconnected
            ) {
                void connection.stop();
            }
        };
    }, []);

    return (
        <main className="mx-auto max-w-2xl space-y-6 p-8">
            <h1 className="text-2xl font-bold">
                Credit Note Notifications
            </h1>

            <section className="rounded-lg border p-4">
                <p>
                    <strong>Connection:</strong> {status}
                </p>

                <p>
                    <strong>Logged-in user code:</strong>{" "}
                    {userCode || "Not available"}
                </p>
            </section>

            <section className="space-y-3">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">
                        Notifications
                    </h2>

                    <span className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800">
                        {notifications.length} received
                    </span>
                </div>

                {notifications.length === 0 ? (
                    <div className="rounded-lg border border-dashed p-8 text-center text-gray-500">
                        No notifications received yet.
                    </div>
                ) : (
                    notifications.map((notification, index) => (
                        <article
                            key={`${notification.creditNoteNumber}-${notification.createdAt}-${index}`}
                            className="rounded-lg border p-4 shadow-sm"
                        >
                            <h3 className="font-semibold">
                                {notification.title}
                            </h3>

                            <p className="mt-1 text-sm text-gray-700">
                                {notification.message}
                            </p>

                            <p className="mt-2 text-sm">
                                <strong>Credit note:</strong>{" "}
                                {notification.creditNoteNumber}
                            </p>

                            <p className="mt-1 text-xs text-gray-500">
                                {new Date(
                                    notification.createdAt
                                ).toLocaleString()}
                            </p>
                        </article>
                    ))
                )}
            </section>
        </main>
    );
}