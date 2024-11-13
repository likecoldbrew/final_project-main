import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { format } from "date-fns";
import {
  Avatar,
  Box,
  Card,
  CardContent,
  CardHeader,
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from "@mui/material";
import {
  Difference,
  EditCalendar,
  EventBusy,
  Healing,
  Mail,
  MedicalInformation,
  MedicationLiquid,
  Person,
  Phone,
  Room,
  Today
} from "@mui/icons-material";
import { Loader } from "lucide-react";

export default function DoctorDetail() {
  const { userNo } = useParams(); // URL에서 유저번호 가져오기
  const id = parseInt(userNo);
  const [loading, setLoading] = useState(true); // 로딩 상태 추가

  // 날짜 포맷팅
  const formatDate = (dateString) => {
    if (!dateString) return dateString;
    return format(new Date(dateString), "yy.MM.dd");
  };

  // 주민등록번호 포맷팅
  const formatRrn = (rrn) => {
    if (!rrn) return rrn;
    return rrn.length >= 8 ? `${rrn.slice(0, 8)}${"*".repeat(rrn.length - 8)}` : rrn;
  };

  const [data, setData] = useState({
    users: {}, // 유저 정보
    education: [], // 학력
    career: [], // 경력
    reserves: [], // 예약 목록
    records: [],  // 진단 목록
    prescription: [], // 처방 목록
    dayOff: [], // 휴무 신청 목록
    hospitalize: []  // 입원 신청 내역
  });

  // API 호출
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [userResponse, reserveResponse, recordResponse,
          prescriptionResponse, dayOffResponse, hospitalizeResponse] = await Promise.all([
          fetch(`/api/users/detail/${id}`),
          fetch(`/api/reserve/${id}`),
          fetch(`/api/medical_record/${id}`),
          fetch(`/api/prescription/${id}`),
          fetch(`/api/dayOff/doctor/${id}`),
          fetch(`/api/hospitalization/doctor/${id}`)
        ]);

        const userData = await userResponse.json();
        const reserveData = await reserveResponse.json();
        const recordData = await recordResponse.json();
        const prescriptionData = await prescriptionResponse.json();
        const hospitalizeData = await hospitalizeResponse.json();
        const dayOffData = await dayOffResponse.json();

        setData({
          users: userData.user || {},
          education: userData.education || [],
          career: userData.career || [],
          reserves: (reserveData && reserveData.length > 0 ? reserveData : []).map((res) => ({
            ...res,
            reserveTime: formatDate(res.reserveTime), // 예약일자 포맷팅
            status: res.status === 0 ? "승인 대기" : "승인 완료"
          })),
          records: (recordData && recordData.length > 0 ? recordData : []).map((record) => ({
            ...record,
            createAt: formatDate(record.createAt) // 진단일자 포맷팅
          })),
          prescription: (prescriptionData && prescriptionData.length > 0 ? prescriptionData : []).map((pres) => ({
            ...pres,
            createAt: formatDate(pres.createAt) // 처방일자 포맷팅
          })),
          dayOff: (dayOffData && dayOffData.length > 0 ? dayOffData : []).map((day) => ({
            ...day,
            dayOff: formatDate(day.dayOff), // 휴무 신청일자 포맷팅
            dayOffType: day.dayOffType === 0 ? "휴무" : day.dayOffType === 1 ? "오전 반차" : "오후 반차",
            status: day.status === "N" ? "승인 대기" : "승인 완료"
          })),
          hospitalize: (hospitalizeData && hospitalizeData.length > 0 ? hospitalizeData : []).map((hospital) => ({
            ...hospital,
            startDate: formatDate(hospital.startDate), // 입원일 포맷팅
            dueDate: formatDate(hospital.dueDate), // 예정 퇴원일 포맷팅
            endDate: formatDate(hospital.endDate) // 퇴원일 포맷팅
          }))
        });
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="text-center text-gray-400">
          <Loader className="animate-spin" size={50} />
        </div>
      </div>
    );
  }

  const { users, education, career, records, reserves, prescription, dayOff, hospitalize } = data;

  const rrn = users?.userRrn || "";
  const formattedRrn =
    rrn.length >= 8 ? `${rrn.slice(0, 8)}${"*".repeat(rrn.length - 8)}` : rrn;

  const dashboardItems = [
    {
      icon: <EventBusy />,
      title: "휴무 신청 목록",
      content: dayOff,
      headers: ["유형", "구분", "휴무신청일자"],
      fields: ["dayOffType", "status", "dayOff"]
    },
    {
      icon: <MedicalInformation />,
      title: "예약 목록",
      content: reserves,
      headers: ["환자", "증상", "구분", "예약일자"],
      fields: ["userName", "symptom", "status", "reserveTime"]
    },
    {
      icon: <Difference />,
      title: "진단 목록",
      content: records,
      headers: ["환자", "진단", "치료", "처방", "내용", "진단일자"],
      fields: ["userName", "diagnosis", "treatment", "prescription", "notes", "createAt"]
    },
    {
      icon: <Healing />,
      title: "처방 목록",
      content: prescription,
      headers: ["환자", "약물명", "용량", "복용 빈도", "기간", "지침", "처방일자"],
      fields: ["userName", "medicationName", "dosage", "frequency", "duration", "instructions", "createAt"]
    },
    {
      icon: <MedicationLiquid />,
      title: "입원 신청 내역",
      content: hospitalize,
      headers: ["환자", "병실명", "층", "방", "자리", "병명", "구분", "입원일자", "예정 퇴원일", "퇴원일"],
      fields: ["userName", "roomName", "floor", "roomType", "seatNo", "diseaseName", "status", "startDate", "dueDate", "endDate"]
    }
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {users && [users].map((user) => (
        <Card key={user.userNo} sx={{ mb: 4 }}>
          <CardHeader sx={{ px: 3, pt: 3 }}
                      avatar={
                        <Avatar sx={{ width: 80, height: 80 }}>
                          {user.userName}
                        </Avatar>
                      }
                      title={<Typography variant="h4">{user.userName}</Typography>}
                      subheader={
                        <Typography variant="h6">
                          {career[0] ? career[0].departmentName : null}
                        </Typography>
                      }
          />
          <CardContent>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2, px: 3 }}>
              <Box
                sx={{ display: "flex", alignItems: "center", minWidth: "45%" }}
              >
                <Person sx={{ mr: 1 }} />
                <Typography>{formatRrn(user.userRrn)}</Typography>
              </Box>
              <Box
                sx={{ display: "flex", alignItems: "center", minWidth: "45%" }}
              >
                <Phone sx={{ mr: 1 }} />
                <Typography>{user.phone}</Typography>
              </Box>
              <Box
                sx={{ display: "flex", alignItems: "center", minWidth: "45%" }}
              >
                <Mail sx={{ mr: 1 }} />
                <Typography>{user.email}</Typography>
              </Box>
              <Box
                sx={{ display: "flex", alignItems: "center", minWidth: "45%" }}
              >
                <Room sx={{ mr: 1 }} />
                <Typography>
                  {user.userAdd} {user.userAdd2}
                </Typography>
              </Box>
              <Box
                sx={{ display: "flex", alignItems: "center", minWidth: "45%" }}
              >
                <Today sx={{ mr: 1 }} />
                <Typography>
                  Joined
                  {user.createAt
                    ? format(user.createAt, "yyyy.MM.dd HH:SS:ss")
                    : null}
                </Typography>
              </Box>
              <Box
                sx={{ display: "flex", alignItems: "center", minWidth: "45%" }}
              >
                <EditCalendar sx={{ mr: 1 }} />
                <Typography>
                  Updated{" "}
                  {user.updateAt
                    ? format(user.updateAt, "yyyy.MM.dd HH:SS:ss")
                    : null}
                </Typography>
              </Box>
            </Box>

            <Typography variant="h6" sx={{ mb: 1, px: 3, pt: 2 }}>
              학력
            </Typography>
            <Box sx={{ mb: 1, px: 3 }}>
              {education.map((item, index) => (
                <ul
                  key={index}
                  sx={{ mr: 1, mb: 1 }}
                  color="primary"
                  variant="outlined"
                >
                  <li>
                    {item.educationDate} {item.educationBackground}
                  </li>
                </ul>
              ))}
            </Box>

            <Typography variant="h6" sx={{ mb: 1, px: 3, pt: 2 }}>
              경력
            </Typography>
            <Box sx={{ mb: 1, px: 3 }}>
              {career.map((item, index) => (
                <ul
                  key={index}
                  sx={{ mr: 1, mb: 1 }}
                  color="primary"
                  variant="outlined"
                >
                  <li>
                    {item.careerDate} {item.careerInfo}
                  </li>
                </ul>
              ))}
            </Box>
          </CardContent>
        </Card>
      ))}

      {/* 리스트 */}
      <Box display="flex" flexWrap="wrap" gap={2}>
        {dashboardItems.map((item, index) => (
          <Box
            key={index}
            flex="1 1 calc(50% - 16px)"
            minWidth="300px"
            sx={{ mb: 2 }}
          >
            <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
              <CardHeader
                avatar={
                  <Box
                    sx={{
                      padding: "8px",
                      backgroundColor: "rgba(25, 118, 210, 0.1)",
                      borderRadius: "50%"
                    }}
                  >
                    {item.icon}
                  </Box>
                }
                title={<Typography variant="h6">{item.title}</Typography>}
              />
              <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column", padding: 0 }}>
                {item.content.length > 0 ? (
                  <TableContainer sx={{ flexGrow: 1, padding: 0, margin: 0 }}>
                    <Table size="small" sx={{ padding: 0 }}>
                      <TableHead>
                        <TableRow>
                          {item.headers.map((header, idx) => (
                            <TableCell sx={{ fontWeight: "bold", textAlign: "center", whiteSpace: "nowrap" }}
                                       key={idx}>{header}</TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {item.content.map((record, rowIndex) => (
                          <TableRow key={rowIndex}>
                            {item.fields.map((key, cellIndex) => (
                              <TableCell key={cellIndex} sx={{ textAlign: "center" }}>
                                {record[key]}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: "center" }}>
                    정보가 없습니다.
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>
    </Container>
  );
}
