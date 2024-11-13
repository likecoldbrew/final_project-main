import React, { useEffect, useState } from "react";
import axios from "axios";

const socialOptions = [
  { id: 1, label: "Facebook" },
  { id: 2, label: "LinkedIn" },
  { id: 3, label: "Instagram" },
  { id: 4, label: "Twitter" },
  { id: 5, label: "YouTube" }
];

export default function RoomApprovalRequest({ closeModal }) {
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [openStates, setOpenStates] = useState([false, false, false]);
  const [selectedValues, setSelectedValues] = useState(["Facebook", "LinkedIn", "Instagram"]);


  const toggleDropdown = (index: number) => {
    setOpenStates(prev => prev.map((state, i) => i === index ? !state : false));
  };

  const handleSelect = (index: number, value: string) => {
    setSelectedValues(prev => prev.map((val, i) => i === index ? value : val));
    setOpenStates(prev => prev.map((state, i) => i === index ? false : state));
  };

  if (!isModalOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-auto max-w-2xl relative">
        <button
          onClick={closeModal}
          className="absolute top-2 right-3 text-gray-400 hover:text-white transition-colors duration-200"
        >
          X
        </button>
        <h2 className="text-black text-md mb-4">병실 선택</h2>
        <div className="flex flex-wrap gap-3">
          {[0, 1, 2].map((index) => (
            <div key={index} className="relative w-48">
              <button
                onClick={() => toggleDropdown(index)}
                className="w-full px-4 py-3 bg-gray-100 rounded-md text-gray-300 flex items-center justify-between hover:bg-amber-200 hover:text-white transition-colors duration-200"
              >
                <span>{selectedValues[index]}</span>
                <span className={`transition-transform duration-200 ${openStates[index] ? "rotate-180" : ""}`}>▼</span>
              </button>

              {openStates[index] && (
                <div
                  className="absolute top-full left-0 w-full mt-1 bg-amber-200 bg-opacity-98 rounded-xl overflow-hidden z-10">
                  {socialOptions.map((option) => (
                    <div
                      key={option.id}
                      onClick={() => handleSelect(index, option.label)}
                      className="px-4 py-3 text-amber-500 cursor-pointer rounded-xl hover:bg-amber-400 hover:text-white transition-colors duration-200"
                    >
                      <span>{option.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-end space-x-2">
          <button
            onClick={() => handleApprovalSubmit}
            className="px-2 py-2 bg-yellow-400 text-white rounded-md hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50 flex items-center"
          >
            승인 요청
          </button>
        </div>
      </div>
    </div>
  );
}