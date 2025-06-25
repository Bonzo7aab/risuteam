import React, { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";

interface GooglePlacesAutocompleteProps {
  onPlaceSelect: (place: {
    name: string;
    address: string;
    map_link: string;
    position: { lat: number; lng: number };
  }) => void;
  placeholder?: string;
}

interface Prediction {
  id: string;
  displayName: {
    text: string;
    languageCode: string;
  };
  formattedAddress: string;
  location: {
    latitude: number;
    longitude: number;
  };
  types: string[];
  googleMapsUri: string;
}

export const GooglePlacesAutocomplete: React.FC<
  GooglePlacesAutocompleteProps
> = ({ onPlaceSelect, placeholder = "Wyszukaj lokalizację..." }) => {
  const [input, setInput] = useState("");
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  // Debounced fetch for autocomplete predictions
  useEffect(() => {
    if (!input || input.length < 3) {
      setPredictions([]);
      setShowDropdown(false);
      return;
    }
    let ignore = false;
    setLoading(true);
    setError(null);
    const controller = new AbortController();
    const fetchPredictions = async () => {
      try {
        const res = await fetch(
          `https://places.googleapis.com/v1/places:autocomplete`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Goog-Api-Key": apiKey || "",
              "X-Goog-FieldMask":
                "places.id,places.displayName,places.formattedAddress,places.location,places.types,places.addressComponents,places.googleMapsUri,places.shortFormattedAddress,places.plusCode",
            } as HeadersInit,
            body: JSON.stringify({
              textQuery: input,
              languageCode: "pl",
              types: ["establishment", "geocode"],
              regionCode: "PL",
            }),
          }
        );
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(
            errorData.error?.message || "Błąd pobierania sugestii"
          );
        }
        const data = await res.json();
        if (!ignore) {
          setPredictions(data?.places || []);
          setShowDropdown((data?.places || []).length > 0);
        }
      } catch (err: any) {
        if (!ignore) setError(err.message || "Błąd autouzupełniania");
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    const timeout = setTimeout(fetchPredictions, 300);
    return () => {
      ignore = true;
      controller.abort();
      clearTimeout(timeout);
    };
  }, [input, apiKey]);

  // Handle click outside dropdown to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch place details by place_id
  const fetchPlaceDetails = async (place_id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `https://places.googleapis.com/v1/places/${place_id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": apiKey || "",
            "X-Goog-FieldMask":
              "id,displayName,formattedAddress,location,googleMapsUri",
          } as HeadersInit,
        }
      );
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          errorData.error?.message || "Błąd pobierania szczegółów miejsca"
        );
      }
      const data = await res.json();
      if (data) {
        onPlaceSelect({
          name: data.displayName?.text || "",
          address: data.formattedAddress || "",
          map_link:
            data.googleMapsUri ||
            `https://www.google.com/maps/search/?api=1&query_place_id=${place_id}`,
          position: {
            lat: data.location?.latitude || 0,
            lng: data.location?.longitude || 0,
          },
        });
      }
    } catch (err: any) {
      setError(err.message || "Błąd pobierania szczegółów");
    } finally {
      setLoading(false);
      setShowDropdown(false);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || predictions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % predictions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex(
        (prev) => (prev - 1 + predictions.length) % predictions.length
      );
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      const selected = predictions[activeIndex];
      if (selected) fetchPlaceDetails(selected.id);
    }
  };

  return (
    <div className="mb-4 relative">
      <Input
        ref={inputRef}
        placeholder={placeholder}
        autoComplete="off"
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
          setActiveIndex(-1);
        }}
        onFocus={() => predictions.length > 0 && setShowDropdown(true)}
        onKeyDown={handleKeyDown}
        disabled={!apiKey}
      />
      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute z-10 w-full bg-white border border-gray-200 rounded shadow-md mt-1 max-h-60 overflow-auto"
        >
          {loading && (
            <div className="p-2 text-sm text-gray-500">Ładowanie...</div>
          )}
          {error && <div className="p-2 text-sm text-red-500">{error}</div>}
          {!loading && !error && predictions.length === 0 && (
            <div className="p-2 text-sm text-gray-500">Brak wyników</div>
          )}
          {predictions.map((pred, idx) => (
            <div
              key={pred.id}
              className={`p-2 cursor-pointer hover:bg-gray-100 text-sm ${
                idx === activeIndex ? "bg-gray-100" : ""
              }`}
              onMouseDown={() => fetchPlaceDetails(pred.id)}
              onMouseEnter={() => setActiveIndex(idx)}
            >
              <span className="font-medium">
                {pred.displayName?.text || pred.formattedAddress}
              </span>
              {pred.formattedAddress && (
                <span className="ml-2 text-gray-500">
                  {pred.formattedAddress}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GooglePlacesAutocomplete;
