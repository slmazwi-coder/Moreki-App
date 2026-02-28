import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Navigation, Check, Loader2, Building2, Info } from "lucide-react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import MallDirectoryModal from "../mall/MallDirectoryModal";

// Sample malls data for South Africa
const SAMPLE_MALLS = [
  { name: "Mall of Africa", distance_km: 5.2, address: "Lone Creek Crescent, Waterfall City, Midrand", stores: ["Woolworths", "Game", "KFC", "Nando's"] },
  { name: "Sandton City", distance_km: 8.1, address: "Sandton Dr, Sandhurst, Sandton", stores: ["Woolworths", "Edgars", "KFC", "McDonald's"] },
  { name: "Carnival City", distance_km: 10.5, address: "A1, Brakpan", stores: ["Pick n Pay", "Spar", "KFC", "Nando's"] },
  { name: "Eastgate Shopping Centre", distance_km: 12.3, address: "43 Bradford Rd, Bedfordview", stores: ["Woolworths", "Game", "Steers", "Clicks"] },
  { name: "Menlyn Park Shopping Centre", distance_km: 15.7, address: "Atterbury Rd & Lois Ave, Menlo Park, Pretoria", stores: ["Woolworths", "Game", "KFC", "Mr Price"] },
  { name: "Gateway Theatre of Shopping", distance_km: 25.0, address: "1 Palm Blvd, Umhlanga Ridge, Durban", stores: ["Woolworths", "Edgars", "McDonald's", "Game"] }
];

export default function MallSelector({ selectedMall, onSelectMall, userLocation, disabled = false }) {
  const [isLocating, setIsLocating] = useState(false);
  const [showDirectoryModal, setShowDirectoryModal] = useState(false);
  const [selectedMallForDirectory, setSelectedMallForDirectory] = useState(null);

  // Fetch real malls from database
  const { data: mallsFromDb = [], isLoading } = useQuery({
    queryKey: ['malls'],
    queryFn: () => base44.entities.Mall.list(),
  });

  const malls = mallsFromDb.length > 0 ? mallsFromDb : SAMPLE_MALLS;

  const requestLocation = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // In a real app, we'd use this to calculate actual distances
          setIsLocating(false);
        },
        () => {
          setIsLocating(false);
        }
      );
    } else {
      setIsLocating(false);
    }
  };

  const handleViewDirectory = (e, mall) => {
    e.stopPropagation();
    setSelectedMallForDirectory(mall);
    setShowDirectoryModal(true);
  };

  return (
    <>
      <Card className="border-stone-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Building2 className="w-5 h-5 text-amber-600" />
            Shopping Mall
          </CardTitle>
          {disabled && selectedMall && (
            <p className="text-sm text-stone-500 mt-2">
              Set in your profile. All items come from stores inside this mall.
            </p>
          )}
        </CardHeader>
      <CardContent className="space-y-4">
        <Button
          variant="outline"
          onClick={requestLocation}
          disabled={isLocating}
          className="w-full border-amber-200 text-amber-700 hover:bg-amber-50"
        >
          {isLocating ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Navigation className="w-4 h-4 mr-2" />
          )}
          Use My Location
        </Button>

        <div className="space-y-2">
          {malls.map((mall) => (
            <motion.button
              key={mall.name}
              whileHover={{ scale: disabled ? 1 : 1.01 }}
              whileTap={{ scale: disabled ? 1 : 0.99 }}
              onClick={() => !disabled && onSelectMall(mall.name)}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                selectedMall === mall.name
                  ? 'border-amber-500 bg-amber-50'
                  : disabled 
                  ? 'border-stone-200 bg-stone-50 opacity-60 cursor-not-allowed'
                  : 'border-stone-200 hover:border-stone-300 bg-white cursor-pointer'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-stone-800">{mall.name}</h4>
                    {selectedMall === mall.name && (
                      <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-stone-500 mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {mall.distance_km} km away
                  </p>
                  <p className="text-xs text-stone-400 mt-1 line-clamp-1">{mall.address}</p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex flex-wrap gap-1">
                      {(mall.stores?.slice(0, 3) || []).map((store, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full"
                        >
                          {typeof store === 'string' ? store : store.name}
                        </span>
                      ))}
                      {mall.stores?.length > 3 && (
                        <span className="text-xs text-stone-500">
                          +{mall.stores.length - 3} more
                        </span>
                      )}
                    </div>
                    {mall.stores && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleViewDirectory(e, mall)}
                        className="h-6 px-2 text-xs text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                      >
                        <Info className="w-3 h-3 mr-1" />
                        View All
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </CardContent>
    </Card>

    <MallDirectoryModal
      isOpen={showDirectoryModal}
      onClose={() => setShowDirectoryModal(false)}
      mall={selectedMallForDirectory}
    />
    </>
  );
}
