import React from "react";
import ShareModal from "@/components/shared/ShareModal";

export default function ShareSimulationModal({ isOpen, onClose, simulationData, chemicals, persona }) {
    const defaultTitle = chemicals?.length
        ? `${chemicals.map(c => c.name || c.scientific_name).filter(Boolean).join(" + ")} Analysis`
        : "Simulation Results";

    return (
        <ShareModal
            isOpen={isOpen}
            onClose={onClose}
            title={defaultTitle}
            shareType="simulation"
            payload={{ simulationData, chemicals, persona }}
        />
    );
}