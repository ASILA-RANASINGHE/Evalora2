"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Loader2 } from "lucide-react";
import { searchLocation, type LocationResult } from "@/lib/actions/location";

// ─── Types ────────────────────────────────────────────────────────

type LeafletModule = typeof import("leaflet");

interface MapSearchModalProps {
  open: boolean;
  onClose: () => void;
  searchQuery: string; // location name from the chat input
}

// Sri Lanka center coordinates
const SRI_LANKA_CENTER: [number, number] = [7.8731, 80.7718];
const DEFAULT_ZOOM = 8;
const LOCATION_ZOOM = 13;

// ─── Component ────────────────────────────────────────────────────

export function MapSearchModal({
  open,
  onClose,
  searchQuery,
}: MapSearchModalProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const markerRef = useRef<import("leaflet").Marker | null>(null);
  const leafletRef = useRef<LeafletModule | null>(null);

  const [status, setStatus] = useState<"loading" | "found" | "not_found" | "idle">("idle");
  const [location, setLocation] = useState<LocationResult | null>(null);

  // Initialize map when modal opens (dynamic import to avoid SSR issues)
  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    const initMap = async () => {
      // Dynamically import leaflet + inject CSS
      const L = await import("leaflet");
      if (cancelled) return;

      // Inject leaflet CSS once
      if (!document.querySelector('link[href*="leaflet.css"]')) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }

      leafletRef.current = L;

      // Small delay to let the modal DOM render
      await new Promise((r) => setTimeout(r, 50));
      if (cancelled || !mapContainerRef.current || mapRef.current) return;

      const map = L.map(mapContainerRef.current, {
        center: SRI_LANKA_CENTER,
        zoom: DEFAULT_ZOOM,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      mapRef.current = map;

      // Force a resize so tiles render correctly inside the modal
      setTimeout(() => map.invalidateSize(), 100);
    };

    initMap();

    return () => {
      cancelled = true;
    };
  }, [open]);

  // Search for location when modal opens with a query
  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setStatus("idle");
      return;
    }

    setStatus("loading");
    try {
      const result = await searchLocation(query);

      if (result) {
        setLocation(result);
        setStatus("found");

        // Place marker on map
        const map = mapRef.current;
        const L = leafletRef.current;
        if (map && L) {
          // Remove existing marker
          if (markerRef.current) {
            markerRef.current.remove();
            markerRef.current = null;
          }

          const marker = L.marker([result.latitude, result.longitude], {
            icon: L.divIcon({
              className: "custom-map-marker",
              html: `<div style="
                background: #2563eb;
                width: 32px;
                height: 32px;
                border-radius: 50% 50% 50% 0;
                transform: rotate(-45deg);
                border: 3px solid white;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
              "><div style="
                transform: rotate(45deg);
                color: white;
                font-size: 14px;
                font-weight: bold;
              ">&#9679;</div></div>`,
              iconSize: [32, 32],
              iconAnchor: [16, 32],
              popupAnchor: [0, -32],
            }),
          }).addTo(map);

          // Build popup content
          let popupHtml = `<strong style="font-size:14px">${result.name}</strong>`;
          if (result.description) {
            popupHtml += `<br/><span style="font-size:12px;color:#64748b">${result.description}</span>`;
          }
          if (result.category) {
            popupHtml += `<br/><span style="font-size:11px;color:#94a3b8;font-style:italic">${result.category.replace(/_/g, " ")}</span>`;
          }

          marker.bindPopup(popupHtml, { maxWidth: 250 }).openPopup();
          markerRef.current = marker;

          map.flyTo([result.latitude, result.longitude], LOCATION_ZOOM, {
            duration: 1.2,
          });
        }
      } else {
        setStatus("not_found");
        setLocation(null);
      }
    } catch {
      setStatus("not_found");
      setLocation(null);
    }
  }, []);

  // Trigger search when modal opens
  useEffect(() => {
    if (open && searchQuery) {
      // Wait for map to initialize before searching
      const timer = setTimeout(() => performSearch(searchQuery), 200);
      return () => clearTimeout(timer);
    }
  }, [open, searchQuery, performSearch]);

  // Cleanup map on close
  useEffect(() => {
    if (!open) {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      setStatus("idle");
      setLocation(null);
    }
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] flex items-center justify-center"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ backdropFilter: "blur(0px)" }}
            animate={{ backdropFilter: "blur(12px)" }}
            exit={{ backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 bg-slate-900/40"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 30 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative z-10 w-[95vw] max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-800">
                    Map Search
                  </h3>
                  {searchQuery && (
                    <p className="text-xs text-slate-400">
                      Searching for &ldquo;{searchQuery}&rdquo;
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-slate-100 transition-colors"
              >
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>

            {/* Status Bar */}
            <div className="px-6 pb-3">
              {status === "loading" && (
                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Searching for location...
                </div>
              )}
              {status === "found" && location && (
                <div className="flex items-center gap-2 text-sm text-emerald-600">
                  <MapPin className="h-4 w-4" />
                  Found: {location.name}
                  {location.description && (
                    <span className="text-slate-400">
                      — {location.description}
                    </span>
                  )}
                </div>
              )}
              {status === "not_found" && (
                <div className="text-sm text-amber-600">
                  Location &ldquo;{searchQuery}&rdquo; not found in our
                  database. Try a different name.
                </div>
              )}
            </div>

            {/* Map Container */}
            <div
              ref={mapContainerRef}
              className="w-full h-[60vh] min-h-[400px] max-h-[650px]"
            />

            {/* Footer */}
            <div className="px-6 py-3 border-t border-slate-100 flex items-center justify-between">
              <p className="text-[10px] text-slate-400">
                Map data &copy; OpenStreetMap contributors
              </p>
              <button
                onClick={onClose}
                className="px-4 py-1.5 text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
