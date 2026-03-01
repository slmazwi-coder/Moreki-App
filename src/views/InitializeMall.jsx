import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle, Database } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export default function InitializeMalls() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const queryClient = useQueryClient();

  const initializeMalls = async () => {
    setLoading(true);
    try {
      // Fetch real mall data using AI
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Provide a comprehensive list of 6 major shopping malls in Gauteng, South Africa with their actual store directories. For each mall include:
        - Exact official name
        - Full address
        - City and province
        - GPS coordinates (latitude, longitude)
        - Complete list of stores with: store name, category (Groceries/Pharmacy/Restaurants/Fashion/Electronics/Other), floor location if available, and whether they have a loyalty program
        - Operating hours
        
        Focus on major malls like: Mall of Africa, Sandton City, Menlyn Park, Eastgate, Cresta, Fourways Mall.
        
        Be accurate with real stores that actually exist in each mall. Include major chains like Woolworths, Pick n Pay, Checkers, Spar, Clicks, Dis-Chem, KFC, Nando's, McDonald's, Steers, Edgars, Woolworths, Game, etc.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            malls: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  city: { type: "string" },
                  province: { type: "string" },
                  address: { type: "string" },
                  latitude: { type: "number" },
                  longitude: { type: "number" },
                  stores: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        category: { type: "string" },
                        floor: { type: "string" },
                        has_loyalty_program: { type: "boolean" }
                      }
                    }
                  },
                  operating_hours: { type: "string" },
                  parking_available: { type: "boolean" }
                }
              }
            }
          }
        }
      });

      // Insert malls into database
      if (result.malls && result.malls.length > 0) {
        await base44.entities.Mall.bulkCreate(result.malls);
        queryClient.invalidateQueries(['malls']);
        setSuccess(true);
      }
    } catch (error) {
      alert('Failed to initialize malls: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100 p-6">
      <div className="max-w-2xl mx-auto mt-20">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-6 h-6 text-amber-600" />
              Initialize Real Mall Data
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-stone-600">
              This will fetch real mall directories from major Gauteng shopping centers and populate the database with actual store information.
            </p>
            
            {success ? (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <p className="text-green-800 font-medium">
                  Successfully initialized mall data! You can now go back to the app.
                </p>
              </div>
            ) : (
              <Button
                onClick={initializeMalls}
                disabled={loading}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-600"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Fetching Real Mall Data...
                  </>
                ) : (
                  'Initialize Mall Database'
                )}
              </Button>
            )}

            <p className="text-xs text-stone-500">
              Note: This uses AI with real-time internet access to fetch accurate store directories from actual South African malls.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
