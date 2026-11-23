"use client";

import {
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";

import {
    Bell,
    Check,
    CheckCheck,
    Clock,
    FileText,
    LoaderCircle,
} from "lucide-react";

import {
    HubConnection,
    HubConnectionBuilder,
    HubConnectionState,
} from "@microsoft/signalr";

import {
    getNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
} from "@/lib/apis";

interface NotificationItem {
    id: number;
    userCode?: string;
    title: string;
    message: string;
    referenceNumber: string;
    processType: string;
    createdAt: string;
    isRead: boolean;
}

interface NotificationProps {
    userCode: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function NotificationBell({
                                             userCode,
                                         }: NotificationProps) {

    const [notifications, setNotifications] =
        useState<NotificationItem[]>([]);

    const [isOpen, setIsOpen] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isMarkingAll, setIsMarkingAll] = useState(false);

    const connectionRef = useRef<HubConnection | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Calculate unread notification count
    const unreadCount = notifications.filter(
        (notification) => !notification.isRead
    ).length;


    // -----------------------------------------
    // 1. LOAD SAVED NOTIFICATIONS FROM DATABASE
    // -----------------------------------------

    const loadNotifications = useCallback(async () => {

        if (!userCode) return;

        try {
            setIsLoading(true);

            const result = await getNotifications(userCode);

            setNotifications(result.data ?? []);

        } catch (error) {
            console.error("Notification loading error:", error);
        } finally {
            setIsLoading(false);
        }

    }, [userCode]);


    useEffect(() => {
        void loadNotifications();
    }, [loadNotifications]);


    // -----------------------------------------
    // 2. RECEIVE REAL-TIME SIGNALR NOTIFICATION
    // -----------------------------------------

    const receiveNotification = useCallback(
        (payload: NotificationItem) => {

            if (!payload?.id) {
                console.error("Invalid notification payload:", payload);
                return;
            }

            setNotifications((previous) => {

                // Prevent duplicate notifications
                const alreadyExists = previous.some(
                    (item) => item.id === payload.id
                );

                if (alreadyExists) {
                    return previous;
                }

                return [
                    {
                        ...payload,
                        isRead: payload.isRead ?? false,
                    },
                    ...previous,
                ];
            });

        },
        []
    );


    // -----------------------------------------
    // 3. CLOSE DROPDOWN WHEN CLICKING OUTSIDE
    // -----------------------------------------

    useEffect(() => {

        const handleClickOutside = (event: MouseEvent) => {

            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }

        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );
        };

    }, []);


    // -----------------------------------------
    // 4. SIGNALR CONNECTION
    // -----------------------------------------

    useEffect(() => {

        let isMounted = true;
        let shouldStop = false;

        let connection: HubConnection | null = null;

        const startConnection = async () => {

            const token =
                localStorage.getItem("token") ||
                sessionStorage.getItem("token");

            if (!token) {
                console.warn("NotificationBell: JWT token not found.");
                return;
            }

            if (!API_URL) {
                console.error("NEXT_PUBLIC_API_URL is not configured.");
                return;
            }

            connection = new HubConnectionBuilder()
                //.withUrl(`https://kbco-reports.servvista.com/hubs/creditnotes`, {
                .withUrl(`https://localhost:7136/hubs/creditnotes`, {
                    accessTokenFactory: () =>
                        localStorage.getItem("token") ||
                        sessionStorage.getItem("token") ||
                        "",
                })
                .withAutomaticReconnect()
                .build();

            connectionRef.current = connection;

            connection.on(
                "ReceiveNotification",
                receiveNotification
            );

            connection.onreconnecting(() => {

                if (isMounted) {
                    console.log("SignalR reconnecting...");
                    setIsConnected(false);
                }

            });

            connection.onreconnected(() => {

                if (isMounted) {
                    console.log("SignalR reconnected!");
                    setIsConnected(true);
                }

            });

            connection.onclose(() => {

                if (isMounted) {
                    console.log("SignalR disconnected.");
                    setIsConnected(false);
                }

            });

            try {

                await connection.start();

                if (shouldStop) {
                    await connection.stop();
                    return;
                }

                console.log("SignalR Connected!");
                console.log("Connection ID:", connection.connectionId);

                if (isMounted) {
                    setIsConnected(true);
                }

            } catch (error) {

                if (!shouldStop) {
                    console.error("SignalR Connection Error:", error);
                }

                if (isMounted) {
                    setIsConnected(false);
                }

            }

        };

        void startConnection();

        return () => {

            isMounted = false;
            shouldStop = true;

            const currentConnection = connection;

            if (connectionRef.current === currentConnection) {
                connectionRef.current = null;
            }

            if (currentConnection) {

                if (
                    currentConnection.state === HubConnectionState.Connected ||
                    currentConnection.state === HubConnectionState.Reconnecting
                ) {
                    void currentConnection.stop();
                }

            }

        };

    }, [receiveNotification]);


    // -----------------------------------------
    // 5. MARK SINGLE NOTIFICATION AS READ
    // -----------------------------------------

    const markAsRead = async (id: number) => {

        const notification = notifications.find(
            (item) => item.id === id
        );

        if (!notification || notification.isRead) {
            return;
        }

        try {

            await markNotificationAsRead(id);

            setNotifications((previous) =>
                previous.map((item) =>
                    item.id === id
                        ? { ...item, isRead: true }
                        : item
                )
            );

        } catch (error) {
            console.error("Mark notification as read error:", error);
        }

    };


    // -----------------------------------------
    // 6. MARK ALL NOTIFICATIONS AS READ
    // -----------------------------------------

    const markAllAsRead = async () => {

        if (unreadCount === 0 || isMarkingAll) {
            return;
        }

        try {

            setIsMarkingAll(true);

            await markAllNotificationsAsRead(userCode);

            setNotifications((previous) =>
                previous.map((item) => ({
                    ...item,
                    isRead: true,
                }))
            );

        } catch (error) {
            console.error("Mark all notifications as read error:", error);
        } finally {
            setIsMarkingAll(false);
        }

    };


    // -----------------------------------------
    // 7. FORMAT DATE
    // -----------------------------------------

    const formatDate = (value: string) => {

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return "Just now";
        }

        return date.toLocaleString();

    };


    // -----------------------------------------
    // 8. UI
    // -----------------------------------------

    return (

        <div className="relative" ref={dropdownRef}>

            {/* Notification bell */}

            <button
                type="button"
                onClick={() => setIsOpen((previous) => !previous)}
                aria-label={`Notifications, ${unreadCount} unread`}
                aria-expanded={isOpen}
                className="relative flex h-10 w-10 items-center justify-center rounded-lg text-navy-text transition-colors hover:bg-surface focus:outline-none focus:ring-2 focus:ring-orange/40"
            >

                <Bell size={19} />

                {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-orange px-1 text-[10px] font-bold leading-none text-white ring-2 ring-card">
                        {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                )}

            </button>


            {/* Dropdown */}

            {isOpen && (

                <div className="absolute right-0 top-12 z-50 w-[min(380px,calc(100vw-2rem))] overflow-hidden rounded-xl border border-border bg-card shadow-xl">

                    {/* Header */}

                    <div className="flex items-center justify-between border-b border-border px-4 py-3">

                        <div>

                            <h2 className="text-base font-semibold text-navy-text">
                                Notifications
                            </h2>

                            <p className="mt-0.5 text-xs text-gray-400">

                                {unreadCount > 0
                                    ? `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`
                                    : "You're all caught up"}

                            </p>

                        </div>


                        {unreadCount > 0 && (

                            <button
                                type="button"
                                onClick={markAllAsRead}
                                disabled={isMarkingAll}
                                className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-orange transition hover:bg-orange/10 disabled:opacity-50"
                            >

                                {isMarkingAll ? (
                                    <LoaderCircle
                                        size={14}
                                        className="animate-spin"
                                    />
                                ) : (
                                    <CheckCheck size={14} />
                                )}

                                Mark all read

                            </button>

                        )}

                    </div>


                    {/* Connection status */}

                    {!isConnected && (

                        <div className="flex items-center gap-2 border-b border-border bg-surface px-4 py-2 text-xs text-gray-400">

                            <LoaderCircle
                                size={14}
                                className="animate-spin"
                            />

                            Connecting to notifications...

                        </div>

                    )}


                    {/* Notification list */}

                    <div className="max-h-[420px] overflow-y-auto">

                        {isLoading && notifications.length === 0 ? (

                            <div className="flex items-center justify-center gap-2 px-6 py-12 text-sm text-gray-400">

                                <LoaderCircle
                                    size={18}
                                    className="animate-spin"
                                />

                                Loading notifications...

                            </div>

                        ) : notifications.length === 0 ? (

                            <div className="flex flex-col items-center justify-center px-6 py-12 text-center">

                                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-surface text-gray-400">
                                    <Bell size={22} />
                                </div>

                                <p className="text-sm font-medium text-navy-text">
                                    No notifications yet
                                </p>

                                <p className="mt-1 text-xs text-gray-400">
                                    Your updates will appear here.
                                </p>

                            </div>

                        ) : (

                            notifications.map((notification) => (

                                <div
                                    key={notification.id}
                                    className={`group relative border-b border-border transition-colors last:border-b-0 ${
                                        notification.isRead
                                            ? "bg-card hover:bg-surface"
                                            : "bg-orange/[0.06] hover:bg-orange/[0.10]"
                                    }`}
                                >

                                    <button
                                        type="button"
                                        onClick={() => {
                                            void markAsRead(notification.id);
                                        }}
                                        className="flex w-full gap-3 px-4 py-4 text-left"
                                    >

                                        {/* Icon */}

                                        <div
                                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                                                notification.isRead
                                                    ? "bg-surface text-muted"
                                                    : "bg-orange/10 text-orange"
                                            }`}
                                        >
                                            <FileText size={18} />
                                        </div>


                                        {/* Content */}

                                        <div className="min-w-0 flex-1 pr-1">

                                            <div className="flex items-start justify-between gap-2">

                                                <p className="text-sm font-semibold text-navy-text">
                                                    {notification.title}
                                                </p>

                                                {!notification.isRead && (
                                                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-orange" />
                                                )}

                                            </div>


                                            <p className="mt-1 text-sm leading-5 text-gray-400">
                                                {notification.message}
                                            </p>


                                            {/* Process type and reference number */}

                                            <div className="mt-2 flex items-center gap-2">

                                                <span className="text-xs font-semibold text-navy-text">
                                                    {notification.processType}:
                                                </span>

                                                <span className="text-xs text-gray-400">
                                                    {notification.referenceNumber}
                                                </span>

                                            </div>


                                            {/* Date */}

                                            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-gray-400">

                                                <Clock size={12} />

                                                <span>
                                                    {formatDate(notification.createdAt)}
                                                </span>

                                            </div>

                                        </div>

                                    </button>


                                    {/* Mark single notification as read */}

                                    {!notification.isRead && (

                                        <button
                                            type="button"
                                            aria-label="Mark notification as read"
                                            title="Mark as read"
                                            onClick={() => {
                                                void markAsRead(notification.id);
                                            }}
                                            className="absolute bottom-3 right-3 rounded-md p-1.5 text-muted opacity-0 transition hover:bg-surface hover:text-orange group-hover:opacity-100 focus:opacity-100"
                                        >
                                            <Check size={15} />
                                        </button>

                                    )}

                                </div>

                            ))

                        )}

                    </div>


                    {/* Footer */}

                    {notifications.length > 0 && (

                        <div className="border-t border-border bg-surface px-4 py-2.5">

                            <p className="text-center text-xs text-muted">

                                {notifications.length} notification
                                {notifications.length === 1 ? "" : "s"}

                            </p>

                        </div>

                    )}

                </div>

            )}

        </div>

    );

}
