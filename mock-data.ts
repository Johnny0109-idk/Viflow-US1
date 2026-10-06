// /lib/mock-data.ts
// Mock data for the "NA" education short-video demo (UEH students).
// UI labels are English; learning content is Vietnamese.
// All names are FICTIONAL. No backend: this file is the single source of truth.

export const APP_NAME = "NA"; // placeholder brand name, replace later

export type SubjectId = "micro" | "stats";

export interface Subject {
  id: SubjectId;
  name: string; // Vietnamese display name
  nameEn: string;
  color: string; // folder / accent color (hex from the design system)
  icon: string; // lucide-react icon name
}

export interface Lecturer {
  id: string;
  name: string;
  title: string;
  avatarColor: string;
  votes: number; // total "great lecturer" votes
}

export interface Video {
  id: string;
  subjectId: SubjectId;
  lecturerId: string;
  title: string;
  chapter: string;
  concept: string;
  durationSec: number; // always 60 in the demo (fake timer)
  likes: number;
  status: "new" | "completed"; // "new" videos appear first in the Feed
  posterColor: string; // placeholder panel color (no real video)
  quizIds: string[];
  flashcardIds: string[]; // unlocked after the quiz is finished
}

export interface Quiz {
  id: string;
  videoId: string;
  question: string;
  options: [string, string, string, string]; // A, B, C, D
  correctIndex: 0 | 1 | 2 | 3;
  explanation: string;
}

export interface Flashcard {
  id: string;
  subjectId: SubjectId;
  videoId: string;
  term: string;
  definition: string;
}

export interface RoadmapConcept {
  id: string;
  title: string;
  videoId?: string; // no videoId = "Coming soon"
}
export interface RoadmapChapter {
  id: string;
  title: string;
  concepts: RoadmapConcept[];
}

// ---------------------------------------------------------------- Subjects
export const subjects: Subject[] = [
  { id: "micro", name: "Kinh tế vi mô", nameEn: "Microeconomics", color: "#3DC63D", icon: "TrendingUp" },
  { id: "stats", name: "Thống kê ứng dụng", nameEn: "Applied Statistics", color: "#7B61FF", icon: "BarChart3" },
];

// Special folder colors
export const folderColors = {
  wrong: "#FF5A87", // "Wrong answers" folder
  unsorted: "#9CA3AF", // "Unsorted" folder
  dueToday: "#7B61FF",
};

// --------------------------------------------------------------- Lecturers
export const lecturers: Lecturer[] = [
  { id: "lec-1", name: "ThS. Trần Hoàng Nam", title: "Khoa Kinh tế", avatarColor: "#FF5A87", votes: 1284 },
  { id: "lec-2", name: "TS. Lê Thu Hà", title: "Khoa Toán - Thống kê", avatarColor: "#FFCC1A", votes: 962 },
];

// ------------------------------------------------------------------ Videos
export const videos: Video[] = [
  // ---- Microeconomics
  {
    id: "micro-1", subjectId: "micro", lecturerId: "lec-1",
    title: "Cầu và quy luật cầu trong 60 giây",
    chapter: "Chương 1: Cung - Cầu", concept: "Cầu",
    durationSec: 60, likes: 2310, status: "completed", posterColor: "#FDE3A0",
    quizIds: ["q-micro-1a", "q-micro-1b"], flashcardIds: ["fc-micro-1", "fc-micro-2"],
  },
  {
    id: "micro-2", subjectId: "micro", lecturerId: "lec-1",
    title: "Cung và điều gì làm đường cung dịch chuyển",
    chapter: "Chương 1: Cung - Cầu", concept: "Cung",
    durationSec: 60, likes: 1875, status: "completed", posterColor: "#A6E22E",
    quizIds: ["q-micro-2a", "q-micro-2b"], flashcardIds: ["fc-micro-3", "fc-micro-4"],
  },
  {
    id: "micro-3", subjectId: "micro", lecturerId: "lec-1",
    title: "Cân bằng thị trường: giá nào là hợp lý?",
    chapter: "Chương 1: Cung - Cầu", concept: "Cân bằng thị trường",
    durationSec: 60, likes: 3102, status: "new", posterColor: "#FFCC1A",
    quizIds: ["q-micro-3a", "q-micro-3b"], flashcardIds: ["fc-micro-5", "fc-micro-6"],
  },
  // ---- Applied Statistics
  {
    id: "stats-1", subjectId: "stats", lecturerId: "lec-2",
    title: "Trung bình, trung vị: dùng cái nào?",
    chapter: "Chương 1: Thống kê mô tả", concept: "Trung bình - Trung vị",
    durationSec: 60, likes: 1540, status: "completed", posterColor: "#FDE3A0",
    quizIds: ["q-stats-1a", "q-stats-1b"], flashcardIds: ["fc-stats-1", "fc-stats-2"],
  },
  {
    id: "stats-2", subjectId: "stats", lecturerId: "lec-2",
    title: "Phương sai và độ lệch chuẩn dễ hiểu",
    chapter: "Chương 1: Thống kê mô tả", concept: "Phương sai - Độ lệch chuẩn",
    durationSec: 60, likes: 1988, status: "new", posterColor: "#A6E22E",
    quizIds: ["q-stats-2a", "q-stats-2b"], flashcardIds: ["fc-stats-3", "fc-stats-4"],
  },
  {
    id: "stats-3", subjectId: "stats", lecturerId: "lec-2",
    title: "Kiểm định giả thuyết và p-value",
    chapter: "Chương 3: Kiểm định giả thuyết", concept: "Giả thuyết và p-value",
    durationSec: 60, likes: 2756, status: "new", posterColor: "#FFCC1A",
    quizIds: ["q-stats-3a", "q-stats-3b"], flashcardIds: ["fc-stats-5", "fc-stats-6"],
  },
];

// Feed order for the demo: unwatched videos first, then watched ones.
export const feedOrder: string[] = ["micro-3", "stats-2", "stats-3", "micro-1", "micro-2", "stats-1"];

// ------------------------------------------------------------------ Quizzes
export const quizzes: Quiz[] = [
  // micro-1
  {
    id: "q-micro-1a", videoId: "micro-1",
    question: "Khi giá của một hàng hóa tăng và các yếu tố khác không đổi, lượng cầu hàng hóa đó sẽ:",
    options: ["Tăng", "Giảm", "Không đổi", "Tăng rồi giảm"], correctIndex: 1,
    explanation: "Theo quy luật cầu, giá và lượng cầu có quan hệ nghịch biến (ceteris paribus).",
  },
  {
    id: "q-micro-1b", videoId: "micro-1",
    question: "Yếu tố nào sau đây làm đường cầu về cà phê (hàng thông thường) dịch chuyển sang phải?",
    options: ["Giá cà phê giảm", "Thu nhập của người tiêu dùng tăng", "Giá cà phê tăng", "Chi phí hạt cà phê tăng"], correctIndex: 1,
    explanation: "Thu nhập tăng làm cầu hàng thông thường tăng, đường cầu dịch phải. Giá cà phê thay đổi chỉ gây di chuyển dọc theo đường cầu.",
  },
  // micro-2
  {
    id: "q-micro-2a", videoId: "micro-2",
    question: "Quy luật cung phát biểu rằng, khi các yếu tố khác không đổi:",
    options: ["Giá tăng thì lượng cung giảm", "Giá tăng thì lượng cung tăng", "Giá không ảnh hưởng đến lượng cung", "Lượng cung luôn bằng lượng cầu"], correctIndex: 1,
    explanation: "Giá cao hơn khuyến khích nhà sản xuất cung ứng nhiều hơn, nên giá và lượng cung đồng biến.",
  },
  {
    id: "q-micro-2b", videoId: "micro-2",
    question: "Chi phí nguyên liệu đầu vào tăng sẽ làm đường cung:",
    options: ["Dịch chuyển sang phải", "Dịch chuyển sang trái", "Không thay đổi", "Trở nên nằm ngang"], correctIndex: 1,
    explanation: "Chi phí sản xuất tăng làm nhà sản xuất cung ít hơn ở mỗi mức giá, đường cung dịch sang trái.",
  },
  // micro-3
  {
    id: "q-micro-3a", videoId: "micro-3",
    question: "Tại mức giá cao hơn giá cân bằng, thị trường sẽ xuất hiện:",
    options: ["Dư cầu (thiếu hụt)", "Dư cung (dư thừa)", "Cân bằng mới", "Giá tự động tăng thêm"], correctIndex: 1,
    explanation: "Giá cao hơn cân bằng khiến lượng cung lớn hơn lượng cầu, tạo ra dư cung và gây áp lực giảm giá.",
  },
  {
    id: "q-micro-3b", videoId: "micro-3",
    question: "Khi cầu tăng và cung không đổi, giá và sản lượng cân bằng sẽ:",
    options: ["Giá tăng, sản lượng giảm", "Giá giảm, sản lượng tăng", "Cả hai cùng tăng", "Cả hai cùng giảm"], correctIndex: 2,
    explanation: "Đường cầu dịch phải dọc theo đường cung dốc lên, nên cả giá và sản lượng cân bằng đều tăng.",
  },
  // stats-1
  {
    id: "q-stats-1a", videoId: "stats-1",
    question: "Cho dữ liệu: 2, 3, 3, 5, 7. Giá trị trung bình cộng là:",
    options: ["3", "4", "5", "3,5"], correctIndex: 1,
    explanation: "Tổng = 2 + 3 + 3 + 5 + 7 = 20; chia cho 5 quan sát được 4.",
  },
  {
    id: "q-stats-1b", videoId: "stats-1",
    question: "Khi dữ liệu có giá trị ngoại lai rất lớn, thước đo nào ít bị ảnh hưởng nhất?",
    options: ["Trung bình cộng", "Trung vị", "Phương sai", "Khoảng biến thiên"], correctIndex: 1,
    explanation: "Trung vị chỉ phụ thuộc vị trí trung tâm của dữ liệu đã sắp xếp nên bền vững trước giá trị ngoại lai.",
  },
  // stats-2
  {
    id: "q-stats-2a", videoId: "stats-2",
    question: "Độ lệch chuẩn đo lường điều gì?",
    options: ["Giá trị phổ biến nhất", "Mức độ phân tán của dữ liệu quanh giá trị trung bình", "Giá trị ở chính giữa", "Chênh lệch giữa hai mẫu"], correctIndex: 1,
    explanation: "Độ lệch chuẩn cho biết các quan sát trung bình lệch bao xa so với trung bình.",
  },
  {
    id: "q-stats-2b", videoId: "stats-2",
    question: "Độ lệch chuẩn bằng:",
    options: ["Bình phương phương sai", "Căn bậc hai của phương sai", "Phương sai chia cho 2", "Trung bình của phương sai"], correctIndex: 1,
    explanation: "Độ lệch chuẩn = √phương sai, nên có cùng đơn vị với dữ liệu gốc.",
  },
  // stats-3
  {
    id: "q-stats-3a", videoId: "stats-3",
    question: "Nếu p-value nhỏ hơn mức ý nghĩa α (ví dụ 0,05), ta kết luận:",
    options: ["Chấp nhận H0", "Bác bỏ H0", "Không thể kết luận gì", "Tăng cỡ mẫu rồi chấp nhận H0"], correctIndex: 1,
    explanation: "p-value nhỏ hơn α nghĩa là dữ liệu khó xảy ra nếu H0 đúng, nên ta bác bỏ H0.",
  },
  {
    id: "q-stats-3b", videoId: "stats-3",
    question: "Sai lầm loại I là:",
    options: ["Bác bỏ H0 khi H0 thực sự đúng", "Không bác bỏ H0 khi H0 sai", "Chấp nhận H1 khi H1 đúng", "Chọn sai cỡ mẫu"], correctIndex: 0,
    explanation: "Sai lầm loại I xảy ra khi bác bỏ giả thuyết không đúng; xác suất mắc lỗi này chính là α.",
  },
];

// --------------------------------------------------------------- Flashcards
export const flashcards: Flashcard[] = [
  // micro
  { id: "fc-micro-1", subjectId: "micro", videoId: "micro-1", term: "Cầu (Demand)", definition: "Lượng hàng hóa người tiêu dùng sẵn sàng và có khả năng mua ở các mức giá khác nhau trong một khoảng thời gian, các yếu tố khác không đổi." },
  { id: "fc-micro-2", subjectId: "micro", videoId: "micro-1", term: "Hàng thông thường", definition: "Hàng hóa có cầu tăng khi thu nhập người tiêu dùng tăng." },
  { id: "fc-micro-3", subjectId: "micro", videoId: "micro-2", term: "Cung (Supply)", definition: "Lượng hàng hóa nhà sản xuất sẵn sàng bán ở các mức giá khác nhau trong một khoảng thời gian, các yếu tố khác không đổi." },
  { id: "fc-micro-4", subjectId: "micro", videoId: "micro-2", term: "Chi phí cơ hội", definition: "Giá trị của phương án tốt nhất bị bỏ qua khi đưa ra một lựa chọn." },
  { id: "fc-micro-5", subjectId: "micro", videoId: "micro-3", term: "Cân bằng thị trường", definition: "Trạng thái tại đó lượng cung bằng lượng cầu; mức giá tương ứng gọi là giá cân bằng." },
  { id: "fc-micro-6", subjectId: "micro", videoId: "micro-3", term: "Thặng dư tiêu dùng", definition: "Chênh lệch giữa mức giá tối đa người tiêu dùng sẵn sàng trả và giá thực tế họ phải trả." },
  // stats
  { id: "fc-stats-1", subjectId: "stats", videoId: "stats-1", term: "Trung bình cộng (Mean)", definition: "Tổng các giá trị chia cho số quan sát." },
  { id: "fc-stats-2", subjectId: "stats", videoId: "stats-1", term: "Trung vị (Median)", definition: "Giá trị ở vị trí chính giữa khi dữ liệu được sắp xếp theo thứ tự." },
  { id: "fc-stats-3", subjectId: "stats", videoId: "stats-2", term: "Phương sai (Variance)", definition: "Trung bình của bình phương độ lệch giữa mỗi quan sát và giá trị trung bình." },
  { id: "fc-stats-4", subjectId: "stats", videoId: "stats-2", term: "Độ lệch chuẩn", definition: "Căn bậc hai của phương sai, thể hiện mức độ phân tán dữ liệu theo đơn vị gốc." },
  { id: "fc-stats-5", subjectId: "stats", videoId: "stats-3", term: "Giả thuyết không (H0)", definition: "Giả thuyết mặc định cho rằng không có khác biệt hay tác động; được kiểm định bằng dữ liệu mẫu." },
  { id: "fc-stats-6", subjectId: "stats", videoId: "stats-3", term: "Giá trị p (p-value)", definition: "Xác suất thu được kết quả mẫu cực đoan như quan sát được, giả sử H0 đúng." },
];

// ------------------------------------------------------------------ Roadmap
export const roadmaps: Record<SubjectId, RoadmapChapter[]> = {
  micro: [
    { id: "m-c1", title: "Chương 1: Cung - Cầu", concepts: [
      { id: "m-1-1", title: "Cầu", videoId: "micro-1" },
      { id: "m-1-2", title: "Cung", videoId: "micro-2" },
      { id: "m-1-3", title: "Cân bằng thị trường", videoId: "micro-3" },
    ]},
    { id: "m-c2", title: "Chương 2: Độ co giãn", concepts: [
      { id: "m-2-1", title: "Co giãn của cầu theo giá" },
      { id: "m-2-2", title: "Co giãn chéo và co giãn theo thu nhập" },
    ]},
    { id: "m-c3", title: "Chương 3: Sản xuất và chi phí", concepts: [
      { id: "m-3-1", title: "Chi phí cố định và chi phí biến đổi" },
      { id: "m-3-2", title: "Chi phí biên" },
    ]},
  ],
  stats: [
    { id: "s-c1", title: "Chương 1: Thống kê mô tả", concepts: [
      { id: "s-1-1", title: "Trung bình - Trung vị", videoId: "stats-1" },
      { id: "s-1-2", title: "Phương sai - Độ lệch chuẩn", videoId: "stats-2" },
    ]},
    { id: "s-c2", title: "Chương 2: Phân phối xác suất", concepts: [
      { id: "s-2-1", title: "Phân phối chuẩn" },
    ]},
    { id: "s-c3", title: "Chương 3: Kiểm định giả thuyết", concepts: [
      { id: "s-3-1", title: "Giả thuyết và p-value", videoId: "stats-3" },
      { id: "s-3-2", title: "Khoảng tin cậy" },
    ]},
  ],
};

// ---------------------------------------------------------------- Seed state
// Initial state of the global store (so no screen is empty on first load).
// isCorrect is derived: selectedIndex === quiz.correctIndex.
export const seedAnswers: { quizId: string; selectedIndex: number }[] = [
  { quizId: "q-micro-1a", selectedIndex: 1 }, // correct
  { quizId: "q-micro-1b", selectedIndex: 0 }, // wrong
  { quizId: "q-micro-2a", selectedIndex: 1 }, // correct
  { quizId: "q-micro-2b", selectedIndex: 2 }, // wrong
  { quizId: "q-stats-1a", selectedIndex: 1 }, // correct
  { quizId: "q-stats-1b", selectedIndex: 1 }, // correct
];

// Flashcards already unlocked (from the 3 completed videos)
export const seedUnlockedFlashcardIds: string[] = [
  "fc-micro-1", "fc-micro-2", "fc-micro-3", "fc-micro-4", "fc-stats-1", "fc-stats-2",
];

// Flashcards already marked "Got it"
export const seedMasteredFlashcardIds: string[] = ["fc-micro-1", "fc-stats-1"];

// Flashcards due for review today (drives the purple "Due today" banner)
export const seedDueTodayFlashcardIds: string[] = ["fc-micro-2", "fc-micro-3", "fc-stats-2"];

// ------------------------------------------------------------------ Profile
export const profile = {
  name: "Nguyễn Minh Anh",
  school: "UEH University",
  major: "Kinh doanh quốc tế",
  streakDays: 5,
  xp: 340,
  level: 3,
  badges: [
    { id: "b1", label: "First quiz", color: "#FFCC1A" },
    { id: "b2", label: "5-day streak", color: "#FF5A87" },
    { id: "b3", label: "Flashcard fan", color: "#7B61FF" },
  ],
};

// ------------------------------------------------------------ Quick helpers
export const getSubject = (id: SubjectId) => subjects.find((s) => s.id === id)!;
export const getLecturer = (id: string) => lecturers.find((l) => l.id === id)!;
export const getVideo = (id: string) => videos.find((v) => v.id === id)!;
export const getQuiz = (id: string) => quizzes.find((q) => q.id === id)!;
export const getFlashcard = (id: string) => flashcards.find((f) => f.id === id)!;
export const getQuizzesForVideo = (videoId: string) => quizzes.filter((q) => q.videoId === videoId);
export const getFlashcardsForVideo = (videoId: string) => flashcards.filter((f) => f.videoId === videoId);
