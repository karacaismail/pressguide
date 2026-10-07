# Doğrulama kaydı

7 Ekim 2026, macOS, Node 24.21 / npm 11.19. Üretim statik çıktısı, loopback test sunucusu.

## Güncel içerik sürümü (temiz yeniden çekim)

- İçerik: 54 rehber adımı; 25 adımda ekran, 18 benzersiz `fresh-*.jpg` dosyası; 25 adım detay sayfası, toplam 26 üretilen sayfa.
- Çekim çerçevesi: yalnız agent tarafından alınmış temiz ekranlar. App Source ekranları 1280×585 olarak yeniden çekildi; GitHub Installation ID çerçevenin dışında. Kullanıcı ekranları ve eski `live-*` / açıklamalı dosyalar kaldırıldı.
- Yeni ekranı olmayan adımlar metin olarak korunur ve geçmiş gözlem olduğunu belirtir; canlı ekran gibi sunulmaz.

Aşağıdaki sonuçlar tüm rehber JSON içeriği dondurulduktan sonra alındı.

- `npm run check`: pass; 0 hata, 0 uyarı, 0 ipucu.
- `npm run format:check`: pass.
- `npm run build`: pass; 26 sayfa.
- `npm test`: 235 pass, 95 skipped, toplam 330; 1,7 dk. Chromium, Firefox, WebKit; mevcut 320/360/375/390/480/639/640/641/768/1024/1280 CSS px matrisi.
- 95 skip: 33 deterministik görsel referans testi not_run (onaylanmış baseline yok); 30 geniş-font tekrar varyantı not_applicable; 32 ek touch tekrar varyantı not_applicable. Asıl üç motorda 320 px geniş-font testi ve Chromium coarse-touch senaryosu: pass.
- CUA 320 px kontrolü: gerçek `documentWidth` 320; tüm açıklama metinleri 16 px.
- TDD: yeni çerçeve testi SVG `rect` uygulamasından önce başarısız oldu, uygulamadan sonra geçti. Bileşen uygulayıcısı bu test turunda veri ve görselleri değiştirmedi; yeni çekimler ve içerik ayrı görevlerde hazırlandı.
- Bağımsız inceleme: 18 `fresh-*` orijinalin tamamı, çizim kodu ve aday 320 px, upload satırı ve Redis dahil 4 son render incelendi; düzeltilmesi gereken bulgu yok. 25 dışa aktarımın ve 54 adımın her biri ayrı ayrı incelenmedi.
- Gerçek fiziksel Safari, iOS/Android cihaz, zoom, ekran okuyucu ve görsel referans karşılaştırması: not_run.
- GitHub Actions/Pages: bu yeni sürüm için bekliyor; CI veya yayın sonucu yok.

## Önceki sürüm (b686637 / 3c728fe dönemi, geçmiş kayıt)

Aşağıdaki sonuçlar eski 51 adımlı, 49 ekranlı içeriğe aittir; güncel sürüm için geçerli değildir.

- `npm run check`: pass; 0 hata, 0 uyarı.
- `npm run format:check`: pass.
- `npm run build`: pass; 50 sayfa; 51 rehber adımı, 49 açıklamalı ekran.
- `npm test`: 202 pass, 95 skipped. Chromium, Firefox, WebKit; 320/360/375/390/480/639/640/641/768/1024/1280 CSS px.
- 33 deterministik görsel referans testi: not_run; onaylanmış baseline yok. 30 geniş-font tekrar varyantı: not_applicable; yalnız 320 px’de üç motorda koşulur. 32 ek touch varyantı: not_applicable; ayrı coarse-touch senaryosu Chromium 320 ile çalıştırıldı.
- JavaScript olmadan okuma, isteğe bağlı Mantine JS/CSS'nin açılmadan indirilmemesi, panel metin boyutu, marka odağı, oturum ilerlemesi ve yatay dönüş: pass.
- macOS WebKit checkbox klavye testi Option+Tab kullanır; diğer motorlarda ve Linux CI'da Tab kullanılır. Outline rengi/stili/genişliği ayrı computed-style özellikleriyle doğrulanır.
- Bağımsız inceleme: o sürümdeki 49 ekranın görünür pikselleri incelendi. Görünür secret veya müşteri verisi bulunmadı.
- Gerçek Safari, iOS/Android fiziksel cihaz, zoom ve tüm adımların bağımsız görsel karşılaştırması: not_run.
- GitHub Actions/Pages: b686637 yayını pass; run 37598750880 başarılı, canlı URL HTTP 200 ve tarayıcıda doğrulandı.

İlk TDD testi eksik bölüm navigasyonunda başarısız oldu. Mantine odak testi kütüphane varsayılan çerçevesini yakaladı; marka tokenı düzeltildikten sonra geçti. WebKit'in yerel klavye tercihi ve CSS shorthand sıralaması testte açıkça ele alındı; doğrulama koşulları kaldırılmadı.

Görsel inceleme metadata/steganografi taraması değildir. WebKit emülasyonu fiziksel Safari doğrulaması değildir. Press build/site başarısı frontend testlerinden çıkarılmaz.

Önceki içerik turunda uzun commit hashinin özet metninde taşması yakalandı; teknik dizelerin sarılması kaynakta düzeltildi. Metin Range geometrisi ve geniş fontlu 320 px regresyonu eklendi. Yeniden tam tur: 202 pass, 95 skip. Üretim gzip boyutları: HTML 21.351 bayt, ilk ortak CSS 2.150 bayt, bootstrap JS 1.254 bayt; gerçek ağdaki optional JS/CSS izolasyonu ayrıca test edildi.
