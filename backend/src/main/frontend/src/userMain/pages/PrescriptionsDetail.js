import React, { useEffect, useState } from "react";
import { useParams, useLocation, Link, useNavigate } from "react-router-dom";
import QuickMenu from "../components/QuickMenu";
import SubCategories from "../components/SubCategory";
import ChatBot from "../components/ChatBot";

const PrescriptionsDetail = ({ prescriptionId }) => {
  const location = useLocation();
  const { selectCategory, selectSubCategory } = location.state || {};
  const [prescriptions, setPrescriptions] = useState(null);

  useEffect(() => {
    fetchPrescriptionsDetail();
  }, [prescriptionId]);

  const formatDate = (timestamp) => {
    return timestamp.split("T")[0];
  };

  const fetchPrescriptionsDetail = async () => {
    try {
      const response = await fetch(`/api/prescription/detail?prescriptionId=${prescriptionId}`);
      const data = await response.json();

      if (!data.isEmpty) {
        const formattedData = {
          ...data,
          createAt: formatDate(data.createAt),
        };
        setPrescriptions(formattedData);
      } else {
        console.log("No data found for this board.");
      }
    } catch (error) {
      console.error("Error fetching board detail:", error);
    }
  };


  if (!prescriptions) {
    return (
      <div className="flex justify-center items-center h-screen">
        처방내역이 없습니다.
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <SubCategories />
      <div className="container mx-auto px-4 py-8 flex flex-grow">
        <main className="flex-grow pr-8">
          <div className="w-full rounded-[10px] bg-white p-6 shadow-blue-700 mb-4">
            <div className="flex justify-between items-center mb-4">
              <div className="text-xl">
                <span className="font-bold">처방약 : <span className="text-sky-500"> {prescriptions.medicationName}</span></span>
              </div>
              <div className="text-gray-600">방문일: {prescriptions.createAt}</div>
            </div>

            <hr className="border-t border-sky-200  mb-6" />
            <div className="mt-4 h-[300px]">
              <p className="font-bold">방문과 : <span className="font-medium text-sky-800 mr-11"> {prescriptions.departmentName}</span>
                담당의 : <span className="font-medium text-sky-800 mr-11"> {prescriptions.doctorName}</span></p>
              <hr className="border-t border-2 border-dashed border-sky-200 mb-6 mt-4" />
              <p className="mb-6">복용일수 : <span className="font-bold text-sky-800 mr-10"> {prescriptions.duration}</span>
                용량: <span className="font-bold text-sky-800"> {prescriptions.dosage}</span></p>
              <p className="mb-6">복용 방법 : <span className="font-bold text-sky-800"> {prescriptions.frequency}</span></p>
              <p className="mb-6">참고 사항 : <span className="font-bold text-sky-800"> {prescriptions.instructions}</span></p>

            </div>
          </div>
          <div className="flex justify-end items-center">
            <Link
              to={`/prescript`} // 목록 페이지로 돌아가기
              state={{ selectCategory, selectSubCategory }}
              className="text-sky-600 hover:underline mr-4"
            >
              목록으로 돌아가기
            </Link>
          </div>
        </main>
        <div className="flex flex-col space-y-4">
          <QuickMenu />
          <ChatBot />
        </div>
      </div>
    </div>
  );
};

export default PrescriptionsDetail;
