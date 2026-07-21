"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { MapPin, Clock, ArrowUpRight } from "lucide-react";
import { WhatsappIcon } from "@/components/icons/whatsapp-icon";

export type Outlet = {
  name: string;
  address: string;
  hours?: string;
  mapsUrl: string;
  whatsapp?: string;
};

export type OutletGroup = {
  id: string;
  title: string;
  outlets: Outlet[];
};

export function OutletAccordion({ groups }: { groups: OutletGroup[] }) {
  return (
    <Accordion
      type="single"
      collapsible
      defaultValue={groups[0]?.id}
      className="space-y-4"
    >
      {groups.map((group) => (
        <AccordionItem
          key={group.id}
          value={group.id}
          className="bg-card border border-border rounded-lg px-4 md:px-6"
        >
          <AccordionTrigger className="text-lg font-semibold text-foreground hover:text-primary hover:no-underline transition-colors">
            {group.title}
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-2">
              {group.outlets.map((outlet, index) => (
                <div
                  key={index}
                  className="group bg-background border border-border rounded-lg p-6 shadow-sm hover:shadow-md hover:border-primary/40 transition-all"
                >
                  <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                    <MapPin className="w-5 h-5 text-primary shrink-0" />
                    {outlet.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {outlet.address}
                  </p>
                  {outlet.hours && (
                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
                      <Clock className="w-4 h-4" />
                      {outlet.hours}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <a
                      href={outlet.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                    >
                      Lihat di Maps
                      <ArrowUpRight className="w-4 h-4" />
                    </a>
                    {outlet.whatsapp && (
                      <a
                        href={`https://wa.me/${outlet.whatsapp}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Hubungi ${outlet.name} via WhatsApp`}
                        className="p-1 hover:bg-muted rounded-lg transition"
                      >
                        <WhatsappIcon className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
