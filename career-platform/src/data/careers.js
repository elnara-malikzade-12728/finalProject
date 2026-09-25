export const careers = [
  {
    id: "frontend-developer",
    title: "Frontend Developer",
    category: "Texnologiya",
    icon: "Code2",
    shortDescription:
      "Müasir, sürətli və istifadəçi dostu veb interfeyslər hazırla.",
    description:
      "Frontend developer istifadəçilərin veb-sayt və tətbiqlərdə gördüyü interfeysləri yaradır. Bu istiqamətdə HTML, CSS, JavaScript və React kimi texnologiyaları öyrənəcəksən.",
    duration: "6–9 ay",
    level: "Başlanğıc",
    demand: "Yüksək",
    skills: [
      "HTML və semantik struktur",
      "CSS və responsive dizayn",
      "JavaScript",
      "React",
      "Git və GitHub",
      "API inteqrasiyası",
    ],
    roadmap: [
      {
        id: "frontend-1",
        title: "HTML əsaslarını öyrən",
        description:
          "Semantik HTML, formalar, cədvəllər və əlçatanlıq prinsiplərini öyrən.",
        type: "Nəzəriyyə",
        duration: "2 həftə",
        resource: "https://developer.mozilla.org/en-US/docs/Learn/HTML",
      },
      {
        id: "frontend-2",
        title: "CSS və responsive dizayn",
        description:
          "Flexbox, Grid, media query və mobil uyğun dizayn üzərində çalış.",
        type: "Nəzəriyyə",
        duration: "3 həftə",
        resource: "https://developer.mozilla.org/en-US/docs/Learn/CSS",
      },
      {
        id: "frontend-3",
        title: "JavaScript əsasları",
        description:
          "Dəyişənlər, funksiyalar, array metodları, DOM və async əməliyyatları öyrən.",
        type: "Nəzəriyyə",
        duration: "6 həftə",
        resource: "https://javascript.info/",
      },
      {
        id: "frontend-4",
        title: "Portfolio saytı hazırla",
        description:
          "Özünü, bacarıqlarını və layihələrini nümayiş etdirən responsive portfolio qur.",
        type: "Praktika",
        duration: "2 həftə",
      },
      {
        id: "frontend-5",
        title: "React öyrən",
        description:
          "Komponentlər, props, state, hooks və routing mövzularını mənimsə.",
        type: "Nəzəriyyə",
        duration: "5 həftə",
        resource: "https://react.dev/learn",
      },
      {
        id: "frontend-6",
        title: "Real layihə hazırla",
        description:
          "API istifadə edən tam funksional React tətbiqi yaradaraq GitHub-da paylaş.",
        type: "Praktika",
        duration: "4 həftə",
      },
    ],
  },
  {
    id: "data-analyst",
    title: "Data Analyst",
    category: "Data",
    icon: "ChartNoAxesCombined",
    shortDescription:
      "Məlumatları araşdır, nəticələr çıxar və qərarverməni dəstəklə.",
    description:
      "Data analyst böyük məlumat dəstlərini təmizləyir, təhlil edir və nəticələri anlaşılan hesabatlara çevirir. Bu peşə biznes və texnologiyanın kəsişməsində yerləşir.",
    duration: "6–10 ay",
    level: "Başlanğıc",
    demand: "Yüksək",
    skills: [
      "Microsoft Excel",
      "SQL",
      "Statistika",
      "Python",
      "Data visualization",
      "Power BI",
    ],
    roadmap: [
      {
        id: "data-1",
        title: "Excel bacarıqlarını inkişaf etdir",
        description:
          "Formullar, pivot table, məlumat təmizləmə və qrafiklər üzərində çalış.",
        type: "Nəzəriyyə",
        duration: "3 həftə",
      },
      {
        id: "data-2",
        title: "Statistikanın əsaslarını öyrən",
        description:
          "Orta, median, dispersiya, korrelyasiya və ehtimal anlayışlarını mənimsə.",
        type: "Nəzəriyyə",
        duration: "4 həftə",
      },
      {
        id: "data-3",
        title: "SQL öyrən",
        description:
          "SELECT, JOIN, GROUP BY, subquery və window function mövzularını öyrən.",
        type: "Nəzəriyyə",
        duration: "5 həftə",
        resource: "https://www.postgresql.org/docs/current/tutorial.html",
      },
      {
        id: "data-4",
        title: "Satış məlumatlarını təhlil et",
        description:
          "Nümunə satış dataset-i üzərində təmizləmə və biznes analizi apar.",
        type: "Praktika",
        duration: "2 həftə",
      },
      {
        id: "data-5",
        title: "Power BI dashboard hazırla",
        description:
          "Əsas göstəriciləri təqdim edən interaktiv dashboard yarat.",
        type: "Praktika",
        duration: "3 həftə",
      },
      {
        id: "data-6",
        title: "Portfolio layihəsini paylaş",
        description:
          "Analiz prosesini, nəticələri və vizualları GitHub repository-də sənədləşdir.",
        type: "Karyera",
        duration: "1 həftə",
      },
    ],
  },
  {
    id: "digital-marketing",
    title: "Rəqəmsal Marketinq Mütəxəssisi",
    category: "Marketinq",
    icon: "Megaphone",
    shortDescription:
      "Brendlərin rəqəmsal kanallarda böyüməsinə və auditoriyaya çatmasına kömək et.",
    description:
      "Rəqəmsal marketinq mütəxəssisi sosial media, axtarış sistemləri, reklam və kontent vasitəsilə brendin onlayn inkişafını idarə edir.",
    duration: "4–7 ay",
    level: "Başlanğıc",
    demand: "Yüksək",
    skills: [
      "Marketinq strategiyası",
      "Sosial media",
      "SEO",
      "Kontent marketinqi",
      "Google Analytics",
      "Reklam kampaniyaları",
    ],
    roadmap: [
      {
        id: "marketing-1",
        title: "Marketinq əsaslarını öyrən",
        description:
          "Hədəf auditoriya, müştəri davranışı, funnel və brend mövqeləndirməsini öyrən.",
        type: "Nəzəriyyə",
        duration: "3 həftə",
      },
      {
        id: "marketing-2",
        title: "Kontent strategiyası hazırla",
        description:
          "Bir brend üçün aylıq kontent planı və paylaşım təqvimi qur.",
        type: "Praktika",
        duration: "2 həftə",
      },
      {
        id: "marketing-3",
        title: "SEO əsaslarını mənimsə",
        description:
          "Açar söz araşdırması, on-page SEO və texniki SEO prinsiplərini öyrən.",
        type: "Nəzəriyyə",
        duration: "4 həftə",
        resource: "https://developers.google.com/search/docs/fundamentals/seo-starter-guide",
      },
      {
        id: "marketing-4",
        title: "Reklam kampaniyası simulyasiyası et",
        description:
          "Hədəf auditoriya, büdcə, reklam mətni və ölçülə bilən məqsədlər müəyyən et.",
        type: "Praktika",
        duration: "2 həftə",
      },
      {
        id: "marketing-5",
        title: "Analitika alətlərini öyrən",
        description:
          "Əsas trafik, conversion və engagement göstəricilərini təhlil et.",
        type: "Nəzəriyyə",
        duration: "3 həftə",
      },
      {
        id: "marketing-6",
        title: "Marketinq portfolio-su yarat",
        description:
          "Strategiya, kontent nümunələri və kampaniya hesabatını portfolio-da birləşdir.",
        type: "Karyera",
        duration: "2 həftə",
      },
    ],
  },
  {
    id: "graphic-designer",
    title: "Qrafik Dizayner",
    category: "Dizayn",
    icon: "Palette",
    shortDescription:
      "İdeyaları güclü və yaddaqalan vizual həllərə çevir.",
    description:
      "Qrafik dizayner brend kimliyi, sosial media materialları və rəqəmsal məhsullar üçün vizual kommunikasiya həlləri hazırlayır.",
    duration: "5–8 ay",
    level: "Başlanğıc",
    demand: "Orta",
    skills: [
      "Dizayn prinsipləri",
      "Tipoqrafiya",
      "Rəng nəzəriyyəsi",
      "Figma",
      "Adobe Photoshop",
      "Brend dizaynı",
    ],
    roadmap: [
      {
        id: "design-1",
        title: "Dizayn prinsiplərini öyrən",
        description:
          "Kompozisiya, kontrast, vizual iyerarxiya, rəng və tipoqrafiyanı öyrən.",
        type: "Nəzəriyyə",
        duration: "4 həftə",
      },
      {
        id: "design-2",
        title: "Figma ilə işləməyi öyrən",
        description:
          "Frame, component, auto layout və prototipləmə bacarıqları əldə et.",
        type: "Nəzəriyyə",
        duration: "3 həftə",
        resource: "https://help.figma.com/hc/en-us/categories/360002051613",
      },
      {
        id: "design-3",
        title: "Sosial media dizayn dəsti hazırla",
        description:
          "Seçdiyin brend üçün ardıcıl üslubda beş sosial media paylaşımı hazırla.",
        type: "Praktika",
        duration: "2 həftə",
      },
      {
        id: "design-4",
        title: "Brend kimliyi yarat",
        description:
          "Loqo, rəng palitrası, tipoqrafiya və istifadə qaydalarını hazırla.",
        type: "Praktika",
        duration: "4 həftə",
      },
      {
        id: "design-5",
        title: "İstifadəçi rəyi topla",
        description:
          "Dizaynlarını təqdim et, rəy topla və nəticələrə əsasən təkmilləşdir.",
        type: "Praktika",
        duration: "1 həftə",
      },
      {
        id: "design-6",
        title: "Portfolio hazırla",
        description:
          "Ən yaxşı üç layihəni proses və nəticələrlə birlikdə təqdim et.",
        type: "Karyera",
        duration: "3 həftə",
      },
    ],
  },
  {
    id: "electrician",
    title: "Elektrik",
    category: "Peşə təhsili",
    icon: "Zap",
    shortDescription:
      "Elektrik sistemlərinin təhlükəsiz quraşdırılması və texniki xidmətini öyrən.",
    description:
      "Elektrik yaşayış və kommersiya obyektlərində elektrik sistemlərini quraşdırır, yoxlayır və nasazlıqları aradan qaldırır.",
    duration: "6–12 ay",
    level: "Başlanğıc",
    demand: "Yüksək",
    skills: [
      "Elektrik təhlükəsizliyi",
      "Elektrik sxemləri",
      "Ölçü cihazları",
      "Kabel və bağlantılar",
      "Nasazlığın müəyyən edilməsi",
      "Texniki xidmət",
    ],
    roadmap: [
      {
        id: "electrician-1",
        title: "Təhlükəsizlik qaydalarını öyrən",
        description:
          "Elektriklə iş zamanı fərdi qoruyucu vasitələr və təhlükəsizlik prosedurlarını öyrən.",
        type: "Nəzəriyyə",
        duration: "2 həftə",
      },
      {
        id: "electrician-2",
        title: "Elektrik nəzəriyyəsini mənimsə",
        description:
          "Gərginlik, cərəyan, müqavimət, güc və elektrik dövrəsi anlayışlarını öyrən.",
        type: "Nəzəriyyə",
        duration: "5 həftə",
      },
      {
        id: "electrician-3",
        title: "Elektrik sxemlərini oxu",
        description:
          "Sadə yaşayış obyekti sxemlərini və standart simvolları öyrən.",
        type: "Nəzəriyyə",
        duration: "3 həftə",
      },
      {
        id: "electrician-4",
        title: "Təlim mərkəzində praktika keç",
        description:
          "Nəzarət altında kabel, rozetka, açar və qoruyucu avadanlıq quraşdır.",
        type: "Praktika",
        duration: "8 həftə",
      },
      {
        id: "electrician-5",
        title: "Nasazlıq axtarışı apar",
        description:
          "Ölçü cihazları ilə sadə elektrik nasazlıqlarını müəyyən etməyi məşq et.",
        type: "Praktika",
        duration: "4 həftə",
      },
      {
        id: "electrician-6",
        title: "Təcrübə proqramına müraciət et",
        description:
          "Yerli müəssisə və ya peşə mərkəzində nəzarətli təcrübə proqramına qoşul.",
        type: "Karyera",
        duration: "Davamlı",
      },
    ],
  },
];

export function getCareerById(careerId) {
  return careers.find((career) => career.id === careerId);
}