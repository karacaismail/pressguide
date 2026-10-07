# Doğrulama kaydı

7 Ekim 2026, macOS, Node 24.21 / npm 11.19. Üretim statik çıktısı, loopback test sunucusu.

- `npm run check`: pass; 0 hata, 0 uyarı.
- `npm run format:check`: pass.
- `npm run build`: pass; 50 sayfa; 51 rehber adımı, 49 açıklamalı ekran.
- `npm test`: 202 pass, 95 skipped. Chromium, Firefox, WebKit; 320/360/375/390/480/639/640/641/768/1024/1280 CSS px.
- 33 deterministik görsel referans testi: not_run; onaylanmış baseline yok. 30 geniş-font tekrar varyantı: not_applicable; yalnız 320 px’de üç motorda koşulur. 32 ek touch varyantı: not_applicable; ayrı coarse-touch senaryosu Chromium 320 ile çalıştırıldı.
- JavaScript olmadan okuma, isteğe bağlı Mantine JS/CSS'nin açılmadan indirilmemesi, panel metin boyutu, marka odağı, oturum ilerlemesi ve yatay dönüş: pass.
- macOS WebKit checkbox klavye testi Option+Tab kullanır; diğer motorlarda ve Linux CI'da Tab kullanılır. Outline rengi/stili/genişliği ayrı computed-style özellikleriyle doğrulanır.
- Bağımsız inceleme: 49 özgün ekranın görünür pikselleri, ERPNext açıklamalı detay, 320 px ana ekran ve kontrol listesi incelendi. Görünür secret veya müşteri verisi bulunmadı.
- Gerçek Safari, iOS/Android fiziksel cihaz, zoom ve tüm adımların bağımsız görsel karşılaştırması: not_run.
- GitHub Actions/Pages: b686637 yayını pass; run 37598750880 başarılı, canlı URL HTTP 200 ve tarayıcıda doğrulandı. Bu yeni içerik sürümünün CI/deploy sonucu ayrıca kontrol edilir.

İlk TDD testi eksik bölüm navigasyonunda başarısız oldu. Mantine odak testi kütüphane varsayılan çerçevesini yakaladı; marka tokenı düzeltildikten sonra geçti. WebKit'in yerel klavye tercihi ve CSS shorthand sıralaması testte açıkça ele alındı; doğrulama koşulları kaldırılmadı.

Görsel inceleme metadata/steganografi taraması değildir. WebKit emülasyonu fiziksel Safari doğrulaması değildir. Press build/site başarısı frontend testlerinden çıkarılmaz.

Son içerik turunda uzun commit hashinin özet metninde taşması yakalandı; teknik dizelerin sarılması kaynakta düzeltildi. Metin Range geometrisi ve geniş fontlu 320 px regresyonu eklendi. Yeniden tam tur: 202 pass, 95 skip. Üretim gzip boyutları: HTML 21.351 bayt, ilk ortak CSS 2.150 bayt, bootstrap JS 1.254 bayt; gerçek ağdaki optional JS/CSS izolasyonu ayrıca test edildi.
