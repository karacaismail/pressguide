# Araştırma önerilerinin uygulanması

Kaynak: kullanıcının `deep-research-report.md` raporu. Kapsam: Pressguide; canlı Press ve müşterilerin verileri değişmez.

| Öneri                             | Uygulama                                                                                          |
| --------------------------------- | ------------------------------------------------------------------------------------------------- |
| Gezinme + çalışma yüzeyi + bağlam | Sekiz adım, mevcut talimat alanı ve isteğe bağlı adım bağlamı.                                    |
| Komut araması                     | `Ctrl/Cmd+K`; adım ara, ok tuşlarıyla seç, Enter ile aç, Escape ile kapat.                        |
| Görünür bağlam                    | Seçilen adım, kaydın doğrulama durumu, uygulanacak işlemler ve kontrol ölçütü.                    |
| Mobil uyarlama                    | Dar ekranda tek yüzey; açılan panel kendi içinde kayar. Sorgu ve seçim boyut değişiminde korunur. |
| Erişilebilir etkileşim            | Modal odak yönetimi, görünür kontrol odağı, kapanışta odağın dönüşü; en az 1rem metin.            |
| Hafif başlangıç                   | Astro HTML; küçük ortak arama kodu. React/Mantine kontrol listesi yalnız açılınca yüklenir.       |
| Tasarım kimliği                   | Mevcut semantik tokenlar; başlık ve gövdede Outfit.                                               |
| Bilinmeyen durumları göster       | Tarihsel, canlı ve bekleyen doğrulamalar ayrı; panel incelemesi tamamlanmış sayılmaz.             |

## Canlı AI için gerekli işler

Bunlar rehber özelliği değildir; ayrı sunucu uygulaması gerektirir. Mevcut sayfa AI servisine bağlanmaz.

1. Kullanıcı/tenant kimliğini sunucuda doğrula. Her araç çağrısını yetkilendir; arayüzde gizlemek yetkilendirme değildir.
2. Önce **açıklama**, sonra **taslak**, en son **işlem** yeteneğini aç. Bağlamı kullanıcıya göster; tenant değişince eski bağlamı temizle.
3. Araç ve çıktı şemalarını sabitle; bilinmeyen araçları ve serbest HTML çıktısını reddet. Secretları tarayıcıya veya public Git'e koyma.
4. Değişiklik öncesi etki ve farkı göster. Silme yalnız açık silme talimatıyla; mevcut siteler ve 60 uygulama korunur.
5. Gerçek işlem durumlarını kaydet; iptal, hata, kısmi başarı ve rollback yolunu göster. Bildirimi kalıcı işlem kaydıyla destekle.
6. Hüseyin Cengiz: servis/auth kurulumu, yedek ve geri yükleme testi, staging, CI/CD ve rollback doğrulaması. Kabul: tenant izolasyonu, yetkisiz çağrı reddi ve geri dönüş testi geçer.

## Kesin mimari kararları

`font.md` ve `ai-first-master-page.md` öneri değil, kullanıcı kararıdır.

- AI yönetim platformu: **Ant Design / ProComponents + Ant Design X + X Card**. Mevcut statik Pressguide bu canlı platformun uygulandığı iddiasını taşımaz.
- Ana akış: kullanıcı niyeti → semantik UI modeli → politika/şema doğrulaması → capability registry → runtime → deterministik bileşen.
- Ana üretim yöntemi declarative UI; kritik CRUD ve onaylar controlled UI. Serbest HTML/JS yalnız izole artifact sandbox; harici yüzeyler MCP Apps.
- OpenUI ve A2UI renderer adaptörleri; AG-UI agent olay/durum/onay omurgası. Tambo MVP alternatifi; araştırmada geçen tüm paketler birlikte kurulmaz.
- Frappe REST/RPC doğrudan modele açılmaz; typed domain adapter ve semantik MCP araçları kullanılır. DocType/report metadata'sı form/rapor sözleşmesine çevrilir.
- Çalışma alanı kimliği, kararlı gezinme, iş sekmeleri, kapsam, niyet, canvas, inspector ve run strip ana shell parçalarıdır. Gerçek görev özeti, kaynak manifesti, plan/fark incelemesi, karar kuyruğu, kanıt, işlem çizelgesi ve kalıcı artifactlar ortak sözleşmelerdir.
- Outfit Latin Extended; gövde 400, etiket 500, başlık 600; gövde satır yüksekliği 1.5. En az 1rem; uzun çeviride font küçültülmez. 200% büyütme, metin aralığı ve font yüklenmeme durumu test edilir.
- WCAG 2.2 AA kabul tabanıdır. WCAG 3'ün güvenli, uyumlu açık dil ve bağlam/odak sürekliliği konuları önceliklidir; taslak standarda uygunluk ilan edilmez.

Birincil kaynaklar: [Ant Design X](https://x.ant.design/components/introduce/), [X Card](https://x.ant.design/x-cards/introduce/), [ProComponents](https://github.com/ant-design/pro-components), [WCAG 2.2](https://www.w3.org/TR/WCAG22/), [WCAG 3 taslağı](https://www.w3.org/TR/wcag-3.0/).
