import React from "react";
import { Slash, Construction, CircleDot, FileSignature } from "lucide-react";

import RowSteps from "./row-steps";

export default function RoadmapStepper() {
  const [currentStep, setCurrentStep] = React.useState(0);

  const roadmapSteps = [
    {
      title: (
        <div className="flex flex-col">
          <span className="font-semibold">Land Signing</span>
          <span className="text-tiny text-primary">September 4, 2025</span>
          <span className="text-tiny text-default-400 hidden md:block mt-1">
            City of Nolanville
          </span>
        </div>
      ),
    },
    {
      title: (
        <div className="flex flex-col">
          <span className="font-semibold">Breaking Ground</span>
          <span className="text-tiny text-primary">February 2026</span>
          <span className="text-tiny text-default-400 hidden md:block mt-1">
            Construction Begins
          </span>
        </div>
      ),
    },
    {
      title: (
        <div className="flex flex-col">
          <span className="font-semibold">Grand Opening</span>
          <span className="text-tiny text-primary">October 2026</span>
          <span className="text-tiny text-default-400 hidden md:block mt-1">
            Facility Launch
          </span>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="mb-8 text-center">
        <div className="flex justify-center mb-4">
          <Slash className="text-primary text-4xl mr-2" size={36} />
          <h2 className="text-2xl font-bold mb-2">THE DINK HOUSE</h2>
          <Slash className="text-primary text-4xl ml-2" size={36} />
        </div>
        <h3 className="text-xl font-bold mb-2">
          Facility Construction Timeline
        </h3>
        <p className="text-default-500">From groundbreaking to grand opening</p>
      </div>

      <div className="bg-content1 p-6 rounded-large shadow-sm border border-default-800">
        <RowSteps
          className="w-full"
          color="primary"
          currentStep={currentStep}
          steps={roadmapSteps}
          onStepChange={setCurrentStep}
        />

        <div className="mt-8 p-4 bg-black rounded-medium border border-primary">
          <div className="flex items-start gap-3">
            <div className="mt-1 text-primary">{getStepIcon(currentStep)}</div>
            <div>
              <h3 className="font-medium text-medium">
                {getStepTitle(currentStep)}
              </h3>
              <p className="text-default-400 mt-1">
                {getStepDescription(currentStep)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getStepIcon(step: number): React.ReactNode {
  switch (step) {
    case 0:
      return <FileSignature size={24} />;
    case 1:
      return <Construction size={24} />;
    case 2:
      return <Slash size={24} />;
    default:
      return <CircleDot size={24} />;
  }
}

function getStepTitle(step: number): string {
  switch (step) {
    case 0:
      return "Land Acquisition for The Dink House";
    case 1:
      return "Pickleball Facility Construction";
    case 2:
      return "The Dink House Grand Opening";
    default:
      return "";
  }
}

function getStepDescription(step: number): string {
  switch (step) {
    case 0:
      return "Official signing ceremony for the land acquisition in the City of Nolanville. This marks the beginning of The Dink House pickleball facility project with all permits and approvals in place.";
    case 1:
      return "Construction begins with groundbreaking ceremony. Site preparation, foundation work, and building of multiple indoor and outdoor pickleball courts. Installation of specialized flooring, lighting, and amenities.";
    case 2:
      return "The Dink House facility grand opening celebration. The premier pickleball complex will be officially opened with a ribbon-cutting ceremony, exhibition matches, and community tournament.";
    default:
      return "";
  }
}
