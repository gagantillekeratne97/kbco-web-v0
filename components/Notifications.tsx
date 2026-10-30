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

interface NotificationPayload {
    title: string;
    message: string;
    creditNoteNumber: string;
    createdAt: string;
}

interface NotificationItem extends NotificationPayload {
    id: string;
    isRead: boolean;
}

export default function NotificationBell() {
    const [notifications, setNotifications] =
        useState<NotificationItem[]>([]);

    const [isOpen, setIsOpen] = useState(false);
    const [isConnected, setIsConnected] = useState(false);

    const connectionRef = useRef<HubConnection | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const unreadCount = notifications.filter(
        (notification) => !notification.isRead
    ).length;

    const receiveNotification = useCallback(
        (payload: NotificationPayload) => {
            const notification: NotificationItem = {
                ...payload,
                id: `${Date.now()}-${Math.random()}`,
                isRead: false,
            };

            setNotifications((previous) => [
                notification,
                ...previous,
            ]);
        },
        []
    );

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
        document.removeEventListener("mousedown", handleClickOutside);
    };
    }, []);

    useEffect(() => {
        let isMounted = true;
        let connection: HubConnection | null = null;        

        const startConnection = async () => {
            const token =
                localStorage.getItem("token") ||
                sessionStorage.getItem("token");

            if (!token) {
                console.warn(
                    "NotificationBell: JWT token was not found."
                );
                return;
            }

            connection = new HubConnectionBuilder()
                .withUrl(
                    "https://localhost:7136/api/hubs/creditNotes",
                    //"https://kbco-reports.servvista.com/api/hubs/creditnotes",
                    {
                        accessTokenFactory: () =>
                            localStorage.getItem("token") ||
                            sessionStorage.getItem("token") ||
                            "",
                    }
                )
                .withAutomaticReconnect()
                .build();

            connectionRef.current = connection;

            connection.on(
                "ReceiveNotification",
                receiveNotification
            );

            connection.onreconnecting(() => {
                if (isMounted) {
                    setIsConnected(false);
                }
            });

            connection.onreconnected(() => {
                if (isMounted) {
                    setIsConnected(true);
                }
            });

            connection.onclose(() => {
                if (isMounted) {
                    setIsConnected(false);
                }
            });

            try {
                await connection.start();

                if (isMounted) {
                    setIsConnected(true);
                }
            } catch (error) {
                console.error(
                    "Notification SignalR connection failed:",
                    error
                );

                if (isMounted) {
                    setIsConnected(false);
                }
            }
        };

        void startConnection();

        return () => {
            isMounted = false;
            connectionRef.current = null;

            if (
                connection &&
                connection.state !==
                    HubConnectionState.Disconnected
            ) {
                void connection.stop();
            }
        };
    }, [receiveNotification]);

    const markAsRead = (id: string) => {
        setNotifications((previous) =>
            previous.map((notification) =>
                notification.id === id
                    ? { ...notification, isRead: true }
                    : notification
            )
        );
    };

    const markAllAsRead = () => {
        setNotifications((previous) =>
            previous.map((notification) => ({
                ...notification,
                isRead: true,
            }))
        );
    };

    const formatDate = (value: string) => {
        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return "Just now";
        }

        return date.toLocaleString();
    };

    return (
        <div className="relative">
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
                        {unreadCount > 99
                            ? "99+"
                            : unreadCount}
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
                                className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-orange transition hover:bg-orange/10"
                            >
                                <CheckCheck size={14} />
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
                        {notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
                                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-surface text-gray-400">
                                    <Bell size={22} />
                                </div>

                                <p className="text-sm font-medium text-navy-text">
                                    No notifications yet
                                </p>

                                <p className="mt-1 text-xs text-gray-400">
                                    Credit note updates will appear here.
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
                                        onClick={() =>
                                            markAsRead(notification.id)
                                        }
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

                                            <p className="mt-2 text-xs font-medium text-navy-text">
                                                Credit note:{" "}
                                                {notification.creditNoteNumber}
                                            </p>

                                            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-gray-400">
                                                <Clock size={12} />
                                                <span>
                                                    {formatDate(
                                                        notification.createdAt
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </button>

                                    {!notification.isRead && (
                                        <button
                                            type="button"
                                            aria-label="Mark notification as read"
                                            title="Mark as read"
                                            onClick={() =>
                                                markAsRead(
                                                    notification.id
                                                )
                                            }
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
                                {notifications.length === 1 ? "" : "s"} in
                                this session
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}