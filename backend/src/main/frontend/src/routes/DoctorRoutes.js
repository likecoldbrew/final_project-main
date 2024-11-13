import React from "react";
import { Route, Routes } from "react-router-dom";
import Doctors from "../doctorPage";
import UserStateChange from "../doctorPage/pages/patientManagement/UserStateChange";
import UserClinicCheck from "../doctorPage/pages/patientManagement/UserClinicCheck";
import UserReservationCheck from "../doctorPage/pages/patientManagement/UserReservationCheck";
import Home from "../doctorPage/pages/Home";
import UserManagement from "../doctorPage/pages/patientManagement/UserManagement";
import CertificateList from "../doctorPage/pages/certificate/CertificateList";
import Certificates from "../doctorPage/pages/certificate/Certificates";
import MyPage from "../doctorPage/pages/mypage/MyPage";
import ChangeMedicalRecord from "../doctorPage/pages/patientManagement/ChangeMedicalRecord";
import MyPatientHospitalization from "../doctorPage/pages/hospitalManagement/MyPatientHospitalization";
import DayOff from "../doctorPage/pages/schedule/DayOff";
import Room from "../doctorPage/pages/hospitalManagement/Room";
import Hospitalization from "../doctorPage/pages/hospitalManagement/Hospitalization";
import RoomApprovalRequest from "../doctorPage/pages/hospitalManagement/RoomApprovalRequest";


function DoctorRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Doctors />}>
        <Route index element={<Home />} />
        <Route path="/list/:userNo" element={<UserManagement />} />
        <Route path="/clinic/:doctorNo" element={<UserClinicCheck />} />
        <Route path="/reserv/:doctorNo" element={<UserReservationCheck />} />
        <Route path="/statemodal" element={<UserStateChange />} />
        <Route path="/changeRecordmodal" element={<ChangeMedicalRecord />} />
        <Route path="/certificateList/:doctorNo" element={<CertificateList />} />
        <Route path="/certificatemodal" element={<Certificates />} />
        <Route path="/mypatientHospitalization/:doctorNo" element={<MyPatientHospitalization />} />
        <Route path="/roomapprovalmodal" element={<RoomApprovalRequest />} />
        <Route path="/room/:doctorNo" element={<Hospitalization />} />
        <Route path="/roommodal" element={<Room />} />
        <Route path="/day/:doctorNo" element={<DayOff />} />
        <Route path="/my/:doctorNo" element={<MyPage />} />
      </Route>

    </Routes>
  );
}

export default DoctorRoutes;

