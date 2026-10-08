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

Mantine AppShell/CopilotKit, canlı yönetim uygulamasında değerlendirilecek seçeneklerdir; statik rehbere sırf raporda geçtiği için yeni framework veya sahte AI eklenmez. Yeni grid, bildirim, impersonation ve kişiselleştirme yalnız ilgili gerçek iş akışı oluştuğunda uygulanır.

Referanslar: [Mantine AppShell](https://mantine.dev/core/app-shell/), [HTML dialog](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog).
