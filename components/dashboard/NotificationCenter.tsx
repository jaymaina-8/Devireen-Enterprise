'use client';

import { useState, useEffect } from 'react';
import { Bell, Check, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  // We could fetch this periodically or via a websocket
  // For now we'll fetch on mount
  useEffect(() => {
    fetch('/api/notifications')
      .then((res) => res.json())
      .then((data) => setNotifications(data.notifications || []))
      .catch(console.error);
  }, []);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  async function markAsRead(id: string) {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative text-gray-400 transition-colors hover:text-gray-700 focus:outline-none"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-red-500 text-[10px] font-bold text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          ></div>
          <div className="absolute right-0 z-50 mt-2 flex max-h-96 w-80 flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg">
            <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 p-4">
              <h3 className="text-sm font-semibold text-gray-900">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <span className="rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-600">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex-1 space-y-1 overflow-y-auto p-2">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-sm text-gray-500">
                  No notifications
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`group flex items-start gap-3 rounded-lg p-3 transition-colors ${!n.is_read ? 'bg-red-50/50' : 'hover:bg-gray-50'}`}
                  >
                    <div
                      className={`mt-1 h-2 w-2 flex-shrink-0 rounded-full ${!n.is_read ? 'bg-red-500' : 'bg-transparent'}`}
                    ></div>
                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-sm ${!n.is_read ? 'font-medium text-gray-900' : 'text-gray-600'}`}
                      >
                        {n.title}
                      </p>
                      <p className="mt-0.5 line-clamp-2 text-xs text-gray-500">
                        {n.message}
                      </p>
                      <div className="mt-2 flex items-center gap-3">
                        <span className="text-[10px] text-gray-400">
                          {new Date(n.created_at).toLocaleDateString()}
                        </span>
                        {n.link && (
                          <Link
                            href={n.link}
                            className="flex items-center text-[10px] text-red-600 hover:underline"
                            onClick={() => setIsOpen(false)}
                          >
                            View <ExternalLink className="ml-0.5 h-3 w-3" />
                          </Link>
                        )}
                        {!n.is_read && (
                          <button
                            onClick={() => markAsRead(n.id)}
                            className="ml-auto flex items-center text-[10px] text-gray-400 hover:text-gray-700"
                          >
                            <Check className="mr-0.5 h-3 w-3" /> Mark read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
