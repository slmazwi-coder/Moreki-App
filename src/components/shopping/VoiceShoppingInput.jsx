import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Mic, MicOff, Loader2, Sparkles, Plus, X, Edit2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from '@/api/base44Client';

export default function VoiceShoppingInput({ onAddItems, isLoading }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [extractedItems, setExtractedItems] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-ZA';

      recognitionInstance.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' ';
          }
        }
        if (finalTranscript) {
          setTranscript(prev => prev + finalTranscript);
        }
      };

      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }
  }, []);

  const startListening = () => {
    if (recognition) {
      setTranscript('');
      setExtractedItems([]);
      recognition.start();
      setIsListening(true);
    }
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
      if (transcript.trim()) {
        processTranscript();
      }
    }
  };

  const processTranscript = async () => {
    if (!transcript.trim()) return;

    setIsProcessing(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Extract a shopping list from this speech transcript. The user is shopping in South Africa.
        
Transcript: "${transcript}"

Extract each item with:
- name (product name)
- quantity (number, default 1)
- size (if mentioned, e.g., "1L", "500g", "large")
- preferred_brand (if mentioned)
- preferred_store (if mentioned, e.g., Woolworths, Spar, KFC, Nando's)
- flavor_or_color (if mentioned)
- category (classify as: Groceries, Beverages, Alcohol & Liquor, Fast Food & Restaurants, Snacks & Confectionery, Clothing & Fashion, Electronics, etc.)

Examples:
- "12 Bonita full cream milk" → {name: "Full cream milk", quantity: 12, preferred_brand: "Bonita", category: "Dairy & Eggs"}
- "2 large Nando's chicken" → {name: "Chicken", quantity: 2, size: "large", preferred_store: "Nando's", category: "Fast Food & Restaurants"}
- "5 bottles of Coca Cola 2 liter" → {name: "Coca Cola", quantity: 5, size: "2L", category: "Beverages"}`,
        response_json_schema: {
          type: "object",
          properties: {
            items: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  quantity: { type: "number" },
                  size: { type: "string" },
                  preferred_brand: { type: "string" },
                  preferred_store: { type: "string" },
                  flavor_or_color: { type: "string" },
                  category: { type: "string" }
                }
              }
            }
          }
        }
      });

      setExtractedItems(response.items || []);
    } catch (error) {
      console.error('Error processing transcript:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveItem = (index) => {
    setExtractedItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleEditItem = (index, field, value) => {
    setExtractedItems(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const handleAddAllItems = () => {
    if (extractedItems.length > 0) {
      onAddItems(extractedItems);
      setTranscript('');
      setExtractedItems([]);
    }
  };

  const startEdit = (index) => {
    setEditingIndex(index);
    setEditValue(extractedItems[index].quantity);
  };

  const saveEdit = (index) => {
    handleEditItem(index, 'quantity', parseInt(editValue) || 1);
    setEditingIndex(null);
  };

  if (!recognition) {
    return (
      <Card className="border-stone-300 bg-stone-100">
        <CardContent className="p-6 text-center">
          <p className="text-stone-500">Voice input not supported in this browser</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-900">
          <Mic className="w-5 h-5" />
          Voice Shopping List
        </CardTitle>
        <p className="text-sm text-purple-600 mt-1">
          Speak naturally: "I need 12 Bonita milk, 5 Coca Cola 2 liter, and 2 large Nando's chicken"
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Voice Control */}
        <div className="flex gap-3">
          {!isListening ? (
            <Button
              onClick={startListening}
              disabled={isProcessing}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white"
            >
              <Mic className="w-4 h-4 mr-2" />
              Start Speaking
            </Button>
          ) : (
            <Button
              onClick={stopListening}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white animate-pulse"
            >
              <MicOff className="w-4 h-4 mr-2" />
              Stop & Process
            </Button>
          )}
        </div>

        {/* Live Transcript */}
        {transcript && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg p-4 border border-purple-200"
          >
            <p className="text-sm text-stone-600 mb-1 font-medium">You said:</p>
            <p className="text-stone-800">{transcript}</p>
          </motion.div>
        )}

        {/* Processing */}
        {isProcessing && (
          <div className="flex items-center justify-center py-6 gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-purple-500" />
            <span className="text-purple-600">Processing your list with AI...</span>
          </div>
        )}

        {/* Extracted Items */}
        {extractedItems.length > 0 && !isProcessing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-purple-900">
                Your Shopping List ({extractedItems.length} items)
              </h4>
              <span className="text-sm text-purple-600">Review and confirm</span>
            </div>

            <div className="space-y-2">
              <AnimatePresence>
                {extractedItems.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="bg-white rounded-lg p-3 border border-purple-200 flex items-center justify-between gap-3"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {editingIndex === index ? (
                          <Input
                            type="number"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={() => saveEdit(index)}
                            onKeyDown={(e) => e.key === 'Enter' && saveEdit(index)}
                            className="w-16 h-8 text-sm"
                            autoFocus
                          />
                        ) : (
                          <Badge 
                            variant="secondary" 
                            className="cursor-pointer hover:bg-purple-100"
                            onClick={() => startEdit(index)}
                          >
                            {item.quantity}x
                          </Badge>
                        )}
                        <span className="font-medium text-stone-800">{item.name}</span>
                        {item.size && (
                          <span className="text-sm text-stone-500">({item.size})</span>
                        )}
                      </div>
                      <div className="flex gap-2 mt-1 text-xs text-stone-500">
                        {item.preferred_brand && <span>Brand: {item.preferred_brand}</span>}
                        {item.preferred_store && <span>Store: {item.preferred_store}</span>}
                        {item.category && <Badge variant="outline" className="text-xs">{item.category}</Badge>}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveItem(index)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <Button
              onClick={handleAddAllItems}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              Add {extractedItems.length} Item{extractedItems.length !== 1 ? 's' : ''} to List
            </Button>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
