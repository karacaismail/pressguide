# Doğrulama kaydı

7 Ekim 2026, macOS, Node 24.21 / npm 11.19. Üretim statik çıktısı, loopback test sunucusu.

- `npm run check`: pass; 0 hata, 0 uyarı.
- `npm run format:check`: pass.
- `npm run build`: pass; 33 sayfa.
- `npm test`: 199 pass, 65 skipped. Chromium, Firefox, WebKit; 320/360/375/390/480/639/640/641/768/1024/1280 CSS px.
- 33 deterministik görsel referans testi: not_run; onaylanmış baseline yok. 32 ek touch varyantı: not_applicable; ayrı coarse-touch senaryosu Chromium 320 ile çalıştırıldı.
- JavaScript olmadan okuma, isteğe bağlı Mantine JS/CSS'nin açılmadan indirilmemesi, panel metin boyutu, marka odağı, oturum ilerlemesi ve yatay dönüş: pass.
- macOS WebKit checkbox klavye testi Option+Tab kullanır; diğer motorlarda ve Linux CI'da Tab kullanılır. Outline rengi/stili/genişliği ayrı computed-style özellikleriyle doğrulanır.
- Bağımsız inceleme: 43 özgün ekranın görünür pikselleri, ERPNext açıklamalı detay, 320 px ana ekran ve kontrol listesi incelendi. Görünür secret veya müşteri verisi bulunmadı.
- Gerçek Safari, iOS/Android fiziksel cihaz, zoom ve tüm adımların bağımsız görsel karşılaştırması: not_run.
- GitHub Actions/Pages: ilk yerel doğrulama anında pending; canlı sonuç Actions kaydından ayrıca kontrol edilir.

İlk TDD testi eksik bölüm navigasyonunda başarısız oldu. Mantine odak testi kütüphane varsayılan çerçevesini yakaladı; marka tokenı düzeltildikten sonra geçti. WebKit'in yerel klavye tercihi ve CSS shorthand sıralaması testte açıkça ele alındı; doğrulama koşulları kaldırılmadı.

Görsel inceleme metadata/steganografi taraması değildir. WebKit emülasyonu fiziksel Safari doğrulaması değildir. Press build/site başarısı frontend testlerinden çıkarılmaz.
