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
  AddComment,
  CreateNewFolder,
  Difference,
  EditCalendar,
  Healing,
  Mail,
  MedicalInformation,
  MedicationLiquid,
  Person,
  Phone,
  Room,
  TextSnippet,
  Today
} from "@mui/icons-material";
import { Loader } from "lucide-react";

export default function UserDetail() {
  const { userNo } = useParams(); // URL에서 userId 가져오기
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

  // 줄바꿈 포맷팅
  const formatContent = (content) => {
    if (!content) return content;
    return content.replace(/<br\s*\/?>/gi, "\n"); // <br> 태그를 줄바꿈 문자로 변환
  };

  const [data, setData] = useState({
    users: {}, // 유저 정보
    reserves: [], // 예약 내역
    records: [], // 진단 내역
    prescription: [], // 처방 내역
    certificates: [], // 진단서 출력 내역
    boards: [], // 작성 글 목록
    inquiries: [], // 일대일문의 내역
    hospitalize: [] // 입원 내역
  });

  // API 호출
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [userResponse, reserveResponse, recordResponse,
          prescriptionResponse, certificateResponse, boardResponse,
          inquiryResponse, hospitalizeResponse] = await Promise.all([
          fetch(`/api/users/detail/${id}`),
          fetch(`/api/reserve/user/${id}`),
          fetch(`/api/medical_record/user?userNo=${id}`),
          fetch(`/api/prescription/user?userNo=${id}`),
          fetch(`/api/certificates/user/${id}`),
          fetch(`/api/board/${id}`),
          fetch(`/api/inquiries/${id}`),
          fetch(`/api/hospitalization/${id}`)
        ]);

        const userData = await userResponse.json();
        const reserveData = await reserveResponse.json();
        const recordData = await recordResponse.json();
        const prescriptionData = await prescriptionResponse.json();
        const boardData = await boardResponse.json();
        const inquiryData = await inquiryResponse.json();
        const certificateData = await certificateResponse.json();
        const hospitalizeData = await hospitalizeResponse.json();

        setData({
          users: userData?.user || {},  // userData가 없으면 빈 객체로 설정
          reserves: reserveData.length ? reserveData.map((res) => ({
            ...res,
            reserveTime: formatDate(res.reserveTime), // 예약일자 포맷팅
            status: res.status === 0 ? "승인 대기" : "승인 완료"
          })) : [], // 데이터가 없으면 빈 배열로 설정
          records: recordData.length ? recordData.map((record) => ({
            ...record,
            createAt: formatDate(record.createAt) // 진단일자 포맷팅
          })) : [], // 데이터가 없으면 빈 배열로 설정
          prescription: prescriptionData.length ? prescriptionData.map((pres) => ({
            ...pres,
            createAt: formatDate(pres.createAt) // 처방일자 포맷팅
          })) : [], // 데이터가 없으면 빈 배열로 설정
          certificates: certificateData.length ? certificateData.map((certs) => ({
            ...certs,
            createAt: formatDate(certs.createAt), // 발급일자 포맷팅
            status: certs.status === 0 ? "승인 대기" : certs.status === 1 ? "승인 완료" : "발급 완료",
            certificateType: certs.certificateType === 1 ? "진단서" : certs.certificateType === 2 ? "소견서" : "입퇴원확인서",
            content: formatContent(certs.content) // <br> 태그를 줄바꿈으로 변환
          })) : [], // 데이터가 없으면 빈 배열로 설정
          boards: boardData.length ? boardData.map((board) => ({
            ...board,
            createAt: formatDate(board.createAt) // 작성일자 포맷팅
          })) : [], // 데이터가 없으면 빈 배열로 설정
          inquiries: inquiryData.length ? inquiryData.map((inquiry) => ({
            ...inquiry,
            createAt: formatDate(inquiry.createAt), // 문의일자 포맷팅
            answer: inquiry.answer ? inquiry.answer : "답변 대기",
            createAdminAt: inquiry.createAdminAt ? formatDate(inquiry.createAdminAt) : "답변 대기" // 답변일자 포맷팅
          })) : [], // 데이터가 없으면 빈 배열로 설정
          hospitalize: hospitalizeData.length ? hospitalizeData.map((hospital) => ({
            ...hospital,
            startDate: formatDate(hospital.startDate), // 입원일 포맷팅
            dueDate: formatDate(hospital.dueDate), // 예정 퇴원일 포맷팅
            endDate: formatDate(hospital.endDate), // 퇴원일 포맷팅
            status: hospital.status === 1 ? "승인 대기" : hospital.status === 2 ? "입원 중" : "퇴원"
          })) : []
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

  const { users, records, reserves, prescription, certificates, boards, inquiries, hospitalize } = data;

  const dashboardItems = [
    {
      icon: <MedicalInformation />,
      title: "예약 목록",
      content: reserves,
      headers: ["의사", "증상", "구분", "예약일자"],
      fields: ["doctorName", "symptom", "status", "reserveTime"]
    },
    {
      icon: <Difference />,
      title: "진료 목록",
      content: records,
      headers: ["의사", "진단", "치료", "처방", "내용", "진단일자"],
      fields: ["doctorName", "diagnosis", "treatment", "prescription", "notes", "createAt"]
    },
    {
      icon: <Healing />,
      title: "처방 목록",
      content: prescription,
      headers: ["의사", "약물명", "용량", "복용 빈도", "기간", "지침", "처방일자"],
      fields: ["doctorName", "medicationName", "dosage", "frequency", "duration", "instructions", "createAt"]
    },
    {
      icon: <CreateNewFolder />,
      title: "서류 출력 내역",
      content: certificates,
      headers: ["유형", "내용", "용도", "구분", "발급일자"],
      fields: ["certificateType", "content", "purpose", "status", "createAt"]
    },
    {
      icon: <TextSnippet />,
      title: "작성 글 목록",
      content: boards,
      headers: ["제목", "내용", "조회수", "작성일자"],
      fields: ["title", "content", "views", "createAt"]
    },
    {
      icon: <AddComment />,
      title: "1:1 문의 내역",
      content: inquiries,
      headers: ["유형", "제목", "내용", "답변", "문의일자"],
      fields: ["type", "title", "content", "answer", "createAt"]
    },
    {
      icon: <MedicationLiquid />,
      title: "입원 내역",
      content: hospitalize,
      headers: ["의사", "병실명", "층", "방", "자리", "병명", "구분", "입원일자", "예정 퇴원일", "퇴원일"],
      fields: ["doctorName", "roomName", "floor", "roomType", "seatNo", "diseaseName", "status", "startDate", "dueDate", "endDate"]
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
                          {user.admin === 2 ? "관리자" : null}
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