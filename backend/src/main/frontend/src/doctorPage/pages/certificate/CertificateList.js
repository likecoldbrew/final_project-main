import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import Certificates from "./Certificates";
import { Search } from "lucide-react";
import axios from "axios";
import { useParams } from "react-router-dom";

Modal.setAppElement("#root");

const CertificateList = () => {
  const { doctorNo } = useParams();
  const id = parseInt(doctorNo);
  const [isCertificateRegisterOpen, setIsCertificateRegisterOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""); // 검색어 상태
  const [filteredCertificates, setFilteredCertificates] = useState([]); // 필터링된 인증서 목록
  const [certificates, setCertificates] = useState([]);
  const [selectedCertificate, setSelectedCertificate] = useState(null); // 선택된 증명서 정보
  const [searchFinishedTerm, setSearchFinishedTerm] = useState("");
  const [filteredFinishCertificates, setFilteredFinishCertificates] = useState([]); // 필터링된 인증서 목록

  useEffect(() => {
    //여기서 리스트업 하고 등록은 모달에서 해 여기선 selectCertificateListOnlyDoctor 리스트만 띄우고 등록 누르면 그 특정 유저연결해
    const fetchCertificatesByDoctorNo = async () => {
      try {
        console.log(id);
        const response = await fetch(`/api/certificates/doctor/${id}`, {
          method: "GET"
        });

        if (response.ok) {
          const data = await response.json();

          console.log(data);

          setCertificates(Array.isArray(data) ? data : [data]);
        } else {
          console.error("인증서 정보를 가져오는 데 실패했습니다.");
        }
      } catch (error) {
        console.error("에러가 발생했습니다:", error);
      }
    };

    fetchCertificatesByDoctorNo();
  }, []);

  const getCertificateTypeLabel = (type) => {
    // console.log("certificateType:", type);
    switch (type) {
      case 1:
        return "진단서";
      case 2:
        return "소견서";
      case 3:
        return "입퇴원서";
      default:
        return "알 수 없는 증명서 타입"; // 0 또는 정의되지 않은 값에 대한 처리
    }
  };

  const getCertificateStatus = (type) => {
    // console.log("certificateStatus:", type);
    switch (type) {
      case 0:
        return "승인 대기";
      case 1:
        return "승인 완료";
      case 2:
        return "발급 완료";
    }
  };

  useEffect(() => {
    // 검색어에 따라 인증서 목록 필터링
    const approvedPatients = certificates.filter(certificate => certificate.status === 0);
    const filtered = approvedPatients.filter(certificate =>
      (certificate.userName ? certificate.userName.toLowerCase() : "").includes(searchTerm.toLowerCase()) // 사용자 이름으로 필터링
    );
    setFilteredCertificates(filtered);
  }, [certificates, searchTerm]);

  useEffect(() => {
    const approvedPatients = certificates.filter(certificate => certificate.status !== 0);
    const result = approvedPatients.filter(certificate =>
      (certificate.userName ? certificate.userName.toLowerCase() : "").includes(searchFinishedTerm.toLowerCase()) // 사용자 이름으로 필터링
    );
    setFilteredFinishCertificates(result);
  }, [certificates, setFilteredFinishCertificates]);

  const openModal = (certificate) => {
    setSelectedCertificate(certificate);
    setIsCertificateRegisterOpen(true);
  };

  const closeModal = () => {
    setIsCertificateRegisterOpen(false);
    setSelectedCertificate(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/*서류 발급 요청 목록*/}
      <div className="bg-blue-400 bg-opacity-30 dark:bg-gray-800 rounded-lg overflow-hidden shadow-md mt-0">
        <div className="flex flex-col md:flex-row justify-start items-center md:space-y-0 h-12">
          <h2 className="text-md font-bold px-6 py-4">서류 발급 요청</h2>
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0">
            <div className="relative w-full md:w-64 ">
              <input
                type="text"
                placeholder="Search"
                className="w-full px-4 py-2 pl-10 pr-4 rounded-md bg-blue-50 "
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md mt-4">
        <table className="w-full">
          <thead>
          <tr className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
            <th
              className="px-3 py-2 text-center text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              번호
            </th>
            <th
              className="px-6 py-3 text-center text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              이름
            </th>
            <th
              className="px-6 py-3 text-center text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              유형
            </th>
            <th
              className="px-6 py-3 text-center text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              용도
            </th>
            <th
              className="px-6 py-3 text-center text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              구분
            </th>
            <th
              className="px-4 py-3 text-center text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              발급 요청 승인
            </th>
          </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {filteredCertificates.length > 0 ? (
            filteredCertificates.map((certificate) => (
              <tr key={certificate.certificateId || Math.random()} className="hover:bg-blue-50">
                <td className="px-3 py-2 text-center text-sm text-gray-500">
                  {certificate.certificateId}
                </td>
                <td className="px-4 py-2 text-center text-sm text-gray-500">
                  {certificate.userName}
                </td>
                <td className="px-6 py-2 text-center text-sm text-gray-500">
                  {getCertificateTypeLabel(certificate.certificateType)}
                </td>
                <td className="px-6 py-2 text-center text-sm text-gray-500">
                  {certificate.purpose}
                </td>
                <td className="px-6 py-2 text-center text-sm text-gray-500">
                  {getCertificateStatus(certificate.status)}
                </td>
                <td className="px-6 py-2 text-center text-sm text-gray-500">
                  {certificate.status === 0 ? (
                    <button
                      className="px-4 bg-violet-400 text-white py-2 rounded hover:bg-violet-500"
                      onClick={() => openModal(certificate)}
                    >
                      등록
                    </button>
                  ) : (
                    <button
                      className="px-4 bg-violet-400 text-white py-2 rounded hover:bg-violet-500"
                      onClick={() => openModal(certificate)}
                    >
                      등록
                    </button>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} className="px-6 py-4 text-xs font-medium text-center text-gray-500">
                증명서를 요청한 환자가 없습니다.
              </td>
            </tr>
          )}
          </tbody>
        </table>
      </div>

      {/*서류 발급 요청 승인 목록*/}
      <div className="bg-amber-300 bg-opacity-30 dark:bg-gray-800 rounded-lg overflow-hidden shadow-md mt-10 ">
        <div className="flex flex-col md:flex-row justify-start items-center md:space-y-0 h-12">
          <h2 className="text-md font-bold px-6 py-4">서류 발급 승인 </h2>
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0">
            <div className="relative w-full md:w-64 ">
              <input
                type="text"
                placeholder="Search"
                className="w-full px-4 py-2 pl-10 pr-4 rounded-md bg-amber-50 "
                value={searchFinishedTerm}
                onChange={(e) => setSearchFinishedTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md mt-4">
        <table className="w-full">
          <thead>
          <tr className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
            <th
              className="px-3 py-2 text-center text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              번호
            </th>
            <th
              className="px-6 py-3 text-center text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              이름
            </th>
            <th
              className="px-6 py-3 text-center text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              유형
            </th>
            <th
              className="px-6 py-3 text-center text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              용도
            </th>
            <th
              className="px-6 py-3 text-center text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              구분
            </th>
          </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {filteredFinishCertificates.length > 0 ? (
            filteredFinishCertificates.map((certificate) => (
              <tr key={certificate.certificateId || Math.random()} className="hover:bg-blue-50">
                <td className="px-3 py-2 text-center text-sm text-gray-500">
                  {certificate.certificateId}
                </td>
                <td className="px-4 py-2 text-center text-sm text-gray-500">
                  {certificate.userName}
                </td>
                <td className="px-6 py-2 text-center text-sm text-gray-500">
                  {getCertificateTypeLabel(certificate.certificateType)}
                </td>
                <td className="px-6 py-2 text-center text-sm text-gray-500">
                  {certificate.purpose}
                </td>
                <td className="px-6 py-2 text-center text-sm text-gray-500">
                  {getCertificateStatus(certificate.status)}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} className="px-6 py-4 text-xs font-medium text-center text-gray-500">
                증명서를 요청한 환자가 없습니다.
              </td>
            </tr>
          )}
          </tbody>
        </table>
      </div>

      <Modal
        className="z-20"
        isOpen={isCertificateRegisterOpen}
        onRequestClose={closeModal}
        overlayClassName="fixed inset-0 bg-black bg-opacity-30"
      >
        <Certificates userInfo={selectedCertificate} closeModal={closeModal} />
      </Modal>
    </div>
  );
};

export default CertificateList;
