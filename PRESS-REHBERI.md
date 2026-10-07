# Press kullanım rehberi

Güncelleme: 7 Ekim 2026 — temiz ekran çekimleri ve Agent Job kanıtları güncellendi

KURULUM DEVAM EDİYOR — egitimxv1 sitesi henüz oluşturulmadı. bench-0027 ve deploy-0027-000001 hazır. kpktsdsd9n: clone, bağımlılık kontrolü ve paketleme başarılı; Upload Build Context HTTP 500 ile başarısız. Agent Job incelemesinde 6 Ekim tarihli Redis AOF disk alanı hatası bulundu; bugünkü neden ayrıca doğrulanmalı. 7 Ekim 07:27’de eski filename protokolüyle başarılı başka build var; protokol uyuşmazlığı kesin neden değildir.

## 1. Release Group ve Team seçimi

Bir Release Group, birlikte build ve deploy edilecek uygulama kaynaklarını tanımlar. Site oluşturma adımı değildir.

1. Press aramasına Release Group List yaz. Add Release Group ile formu aç.
2. Title için egitimxv1 kullan; mevcut kaydı düzeltirken yeni kayıtla karıştırma.
3. Version alanında Version 16; Team alanında ilgili kaynakların sahibi olan takımı seç.

Somut notlar:

- Görselde Administrator görünen bir Team kaydı var. Team alanı oturum açan kullanıcı rolünü seçmez.
- Her zaman Administrator seçmek genel bir kural değildir; bu kurulumda mevcut kaynakların sahibi aynı takım ise seçilir.
- Sonraki canlı adımlarda egitimxv1 / bench-0027 oluşturuldu.
- Bu temiz görüntü mevcut kayıttan yeniden alındı; geçmişteki tıklama veya başarı anının tekrarı değildir.

Doğrulama: Kaydetmeden önce Team ve uygulama kaynaklarının sahipliği uyumlu olmalı.

Açıklamalı ekran: [temiz ekran ve çerçeveler](https://karacaismail.github.io/pressguide/steps/team/)

## 2. Hazır uygulama sunucusunu seç

Servers tablosu kayıtlı ve hazır app sunucularını gruba bağlar.

1. Servers → Add Row.
2. Mevcut app sunucusunu seç. Aynı sunucuyu ikinci satıra tekrar ekleme.

Somut notlar:

- İkinci sunucu eklemek için önce Press içinde ayrı ve hazır bir Server kaydı gerekir; Add Row tek başına Hetzner sunucusu kurmaz.
- Hüseyin Cengiz ikinci sunucunun kapasitesini, agent erişimini, rollerini ve güvenli ağ bağlantısını hazırlar; Asistan Hüseyin gerekirse GoDaddy DNS kaydını uygular; Hüseyin Cengiz doğrular.
- Mevcut çalışan servisleri yeniden başlatmak bu adımın parçası değildir.
- Bu temiz görüntü mevcut kayıttan yeniden alındı; geçmişteki tıklama veya başarı anının tekrarı değildir.

Doğrulama: Canlı oturumda egitimxv1 / bench-0027 grubunda mevcut app sunucusunun seçildiği görüldü. Bu seçim, sunucunun sağlık durumunun veya agent erişiminin bağımsız doğrulaması değildir; build ve deploy sonucu ayrıca kontrol edilmeli.

Açıklamalı ekran: [temiz ekran ve çerçeveler](https://karacaismail.github.io/pressguide/steps/server/)

## 3. Uygulamaları bağımlılık sırasıyla ekle

Framework ilk sırada olmalı; her satırın App ve Source alanları birlikte tamamlanmalı.

1. Apps sekmesini aç. İlk satıra frappe ekle.
2. Education için erpnext satırını education satırından önce ekle.
3. Ardından education; LMS kullanılacaksa kendi branch bağımlılıklarını doğrulayarak payments ve lms ekle.
4. Check Dependent Apps kontrolünü aç; elle kaynak ve sürüm incelemesini de tamamla.

Somut notlar:

- Görselde egitimxv1 / bench-0027 grubunun kaydedilmiş beş satırı görünür: frappe, erpnext, payments, education, lms. Tablo bir yapılandırma kanıtıdır; build başarısı değildir.
- Tüm uygulamaları aynı anda eklemek yerine uyumlu küçük bir küme ile başlayıp build sonucu doğrula.
- Education ve LMS aynı işlevi temsil etmez; kurulacak uygulamalar teknik bağımlılıklarıyla seçilir.
- Bu temiz görüntü mevcut kayıttan yeniden alındı; geçmişteki tıklama veya başarı anının tekrarı değildir.

Doğrulama: Her App kendi gerçek paket adıyla ve doğru App Source ile eşleşmeli.

Açıklamalı ekran: [temiz ekran ve çerçeveler](https://karacaismail.github.io/pressguide/steps/apps/)

## 4. Create a new App ekranı ne yapar?

Bu ekran uygulama kataloğunda teknik kimlik oluşturur; GitHub kodunu sunucuya kurmaz.

1. Gerçek repo içindeki hooks.py app_name değerini doğrula.
2. Name alanına education gibi gerçek paket adını gir; Title okunabilir başlıktır.
3. Frappe kutusunu yalnız framework olan frappe için seç.
4. App kaydını kaydet, ardından o uygulamaya App Source bağla.

Somut notlar:

- education reposu için educator isimli ikinci teknik kimlik oluşturmak doğru değildir.
- Mevcut yanlış kaydı körlemesine silme veya yeniden adlandırma: gruplar ve kaynak bağlantılarını inceleyerek doğru education kaydını kullan.

Doğrulama: App adı repo içindeki uygulama klasörü ve app_name ile aynı olmalı.

Bu adım için henüz ekran kanıtı yok.

## 5. App Source: repo ve branch bağlantısı

App Source aynı App için kullanılacak Git reposunu, branch ve sürüm uyumluluğunu tanımlar.

1. Apps satırında Source alanını aç.
2. Doğru App adına bağlı hazır source varsa onu seç.
3. Kaynak yoksa Create a new App Source ile repo ve branch tanımla.

Somut notlar:

- Görseldeki örnek mevcut Framework kaynağı SRC-frappe-004: App = frappe, Repository URL = https://github.com/frappe/frappe, Branch = version-16, Frappe ve Enabled işaretli.
- Rastgele Source seçme: frappe kaynağını education satırına bağlama.
- Bir App birden fazla branch/source içerebilir; kaynak kimliği uygulama kimliğiyle aynı şey değildir.
- Bu temiz görüntü mevcut kayıttan yeniden alındı; geçmişteki tıklama veya başarı anının tekrarı değildir.

Doğrulama: Her satırda App, Source, repository ve branch eşleşmesini kontrol et.

Açıklamalı ekran: [temiz ekran ve çerçeveler](https://karacaismail.github.io/pressguide/steps/source/)

## 6. Uygulama kimliğini doğrula: education

Geçmiş rgv1 denemesinde education reposu educator adlı farklı bir teknik app kaydıyla temsil edildi. Bu adımın yayımlanmış ekranı yok.

1. Geçmiş educator kaydını örnek alarak ilerleme.
2. education/version-16/education/hooks.py dosyasını aç.
3. app_name = education ve required_apps = erpnext değerlerini doğrula.
4. Grup içinde gerçek education App kaydı ve ona bağlı source kullan.

Somut notlar:

- Press develop kaynağı dependency hooks yolunu App adıyla kuruyor; educator yanlış dosya yoluna dönüşebilir.
- Kurulu Press 0.7.0 (develop) sürümünün commit’i doğrulanmadığı için bu tespit canlı log ile karşılaştırılmalı.

Doğrulama: Yanlış App adı, eksik ERPNext ve build log birlikte incelenmeli.

Bu adım için henüz ekran kanıtı yok.

## 7. Branch gerçekten repoda bulunmalı

Version 16 seçimi GitHub branch adını otomatik doğrulamaz.

1. Repo sayfasında branch listesini aç.
2. education için version-16 branch varlığını doğrula.
3. frappe ve gerekiyorsa erpnext için de version-16 kullan; her uygulama kendi destek sözleşmesiyle kontrol edilir.

Somut notlar:

- LMS dahil her app için version-16 yazmak doğru bir genel kural değildir. Branch mevcut olmalı ve Frappe 16 desteği doğrulanmalı.
- Hareketli version-16 branch tek başına uyum garantisi değildir: candidate release commit manifestleri Python/Frappe sürümleriyle karşılaştırılmalı.

Doğrulama: Kaynak branch GitHub üzerinde bulunmalı; bağımlılıklar o branch dosyalarından okunmalı.

Bu adım için henüz ekran kanıtı yok.

## 8. App Source formunu doğru doldur

Repo URL, App kimliği, branch ve Versions uyumlu olmalı. Görsel, mevcut Framework kaynağının alan düzenini örnek olarak gösterir.

1. Önce doğru App kaydı için hazır source olup olmadığını kontrol et; varsa yeni source oluşturma.
2. Yeni source gerekiyorsa App alanına repo içindeki gerçek app_name değerini ve Repository URL alanına o uygulamanın reposunu gir.
3. Branch alanına repoda gerçekten bulunan ve hedef Frappe sürümünü destekleyen branch’i yaz; Enabled açık olsun.
4. Versions satırına Version 16 ekle; Team grubun takımına uygun olmalı.
5. Frappe kutusunu yalnız framework kaynağında işaretle; diğer uygulamalarda kapalı bırak. Save ile kaydet.

Somut notlar:

- Görseldeki örnek mevcut Framework kaynağıdır (SRC-frappe-004: frappe/frappe, version-16, Frappe işaretli). Bu ekranda yeni kaynak oluşturulmadı; alanların nasıl okunacağını gösterir.
- Education için hazır kaynak SRC-education-003 kullanıldı (App = education, frappe/education, version-16); educator adıyla yeni kaynak oluşturma.
- Public alanı GitHub reposunun görünürlüğüyle aynı karar değildir; Press içi paylaşım anlamını kontrol etmeden değiştirme.
- Bu temiz görüntü mevcut kayıttan yeniden alındı; geçmişteki tıklama veya başarı anının tekrarı değildir.

Doğrulama: Doğru teknik ad ve source uyumluluğu doğrulanmadan release/build başlatma.

Açıklamalı ekran: [temiz ekran ve çerçeveler](https://karacaismail.github.io/pressguide/steps/source-form/)

## 9. Create Release neyi oluşturur?

App Release, kaynak branch üzerindeki bir Git commit referansını kaydeder.

1. App Source kaydı kaydedildikten sonra Actions menüsünü aç.
2. Create Release ile commit kaydını üret.
3. App Release bağlantısından branch ve commit bilgisini kontrol et.

Somut notlar:

- Release oluşması uygulamanın yüklendiği, build olduğu veya çalıştığı anlamına gelmez.
- Bu adımın yayımlanmış ekranı yok. Geçmiş denemede release educator adlı yanlış kaynaktan üretilmişti; doğru source için aynı akış uygulanır.

Doğrulama: App Release doğru App Source ve commit referansına bağlı olmalı.

Bu adım için henüz ekran kanıtı yok.

## 10. Release Group içinde doğru source seçimi

App kaynaklarının seçilmesi build içeriğini belirler.

1. frappe satırına v16 framework source bağla.
2. ERPNext bağımlılığını ekle, ardından education kaynağını bağla.
3. Save ile grubu kaydet.

Somut notlar:

- Görselde education satırına SRC-education-003 bağlı; geçmişteki educator kaynağı bu grupta kullanılmadı.
- SRC isimlerini bu kurulumdan kopyalamak yerine kendi kayıtlarının repo/branch alanlarını incele.
- Bu temiz görüntü mevcut kayıttan yeniden alındı; geçmişteki tıklama veya başarı anının tekrarı değildir.

Doğrulama: Apps tablosunda boş Source veya yanlış App kimliği bulunmamalı.

Açıklamalı ekran: [temiz ekran ve çerçeveler](https://karacaismail.github.io/pressguide/steps/source-selection/)

## 11. Create Deploy Candidate

Deploy Candidate, grup uygulama release’lerinin build için seçilmiş anlık kümesidir.

1. Kaydedilmiş doğru grupta Actions → Create Deploy Candidate.
2. Yeni candidate bağlantısını aç; Apps & Deps listesini incele.

Somut notlar:

- Görsel egitimxv1 / bench-0027 grubunun Actions menüsünü gösterir. Bu grupta Create Deploy Candidate deploy-0027-000001 kaydını üretti; eski rgv1 / bench-0026 grubu ayrı kayıttır.
- Create Duplicate Deploy Candidate ve Change Server farklı işlemlerdir.
- Bu temiz görüntü mevcut kayıttan yeniden alındı; geçmişteki tıklama veya başarı anının tekrarı değildir.

Doğrulama: Candidate içinde framework ve tüm gerekli uygulamalar doğru sırada olmalı.

Açıklamalı ekran: [temiz ekran ve çerçeveler](https://karacaismail.github.io/pressguide/steps/candidate/)

## 12. Build ve deploy başlatma

Eğitim grubunda önce yalnız build başlatılır. Deploy, build Success olduktan sonra ayrı adımdır.

1. deploy-0027-000001 gibi doğrulanmış candidate sayfasında Build menüsünü aç; Complete ile yalnız build başlat.
2. Deploy Candidate Build bağlantısından durum ve Build Steps aşamalarını izle.
3. Build Success olmadan Deploy menüsünü kullanma. Success sonrasında hedef grubu ve sunucuyu yeniden doğrulayıp deploy işlemini ayrıca başlat.

Somut notlar:

- Görsel Build menüsünü gösterir; Complete bir seçenek adıdır, build sonucunun başarılı olduğu anlamına gelmez.
- Bu kurulumda kpktsdsd9n build’i Failure ile bitti; deploy yapılmadı.
- Schedule Build and Deploy ikisini birlikte başlatır; mevcut çalışan siteleri barındıran grupta deploy, migration ve yeniden başlatma etkisi taşıyabilir.
- Bu temiz görüntü mevcut kayıttan yeniden alındı; geçmişteki tıklama veya başarı anının tekrarı değildir.

Doğrulama: Yeni build kaydı oluşmalı ve Success olmalı; deploy ancak bundan sonra ayrı başlatılır. Bu kurulumda deploy henüz yapılmadı.

Açıklamalı ekran: [temiz ekran ve çerçeveler](https://karacaismail.github.io/pressguide/steps/schedule/)

## 13. Preparing: çalışıyor mu?

Geçmiş denemede build yalnız Preparing durumunda görüldü; bu durum başarılı build, deploy veya site kanıtı değildir. Bu adımın yayımlanmış ekranı yok.

1. Build satırını aç, zaman damgası ve aşama loglarını oku.
2. Error Log bağlantısını ve candidate Apps & Deps listesini incele.
3. Preparing uzun sürüyorsa Press worker/scheduler ve build server görevlerini Hüseyin Cengiz’e kanıtlarıyla aktar.
4. Başarılı build sonrasında Deploy ve Bench kaydını ayrıca doğrula.

Somut notlar:

- Yalnız Preparing durumuna bakarak kurulum çalışıyor deme. Hata türü belirlenmeden tekrar tekrar yeni build açma.
- Geçmiş rgv1 denemesinde iki build Failure bulundu; live-error adımına bak. Güncel kpktsdsd9n build’i de Failure; hata-tanisi adımına bak.

Doğrulama: Build başarılı, deploy başarılı ve ilgili Bench hazır olmadan Site adımına geçme.

Bu adım için henüz ekran kanıtı yok.

## 14. Eğitim sitesini oluştur ve doğrula

egitimxv1 sitesi henüz oluşturulmadı. Build Upload Build Context adımında başarısız; başarılı build/deploy gerekli.

1. Başarılı deploy sonrasında uygun Bench üzerinde Create Site / New Site akışını aç.
2. Site adı egitimxv1; panelde yapılandırılmış base domain ile tam adresi oluştur.
3. Kurulacak uygulamaları gerçek bağımlılıklarıyla seç; education için ERPNext gerekir.
4. Oluşturma işinin sonucunu, HTTPS yanıtını, giriş ekranını ve kurulu app listesini kontrol et.

Somut notlar:

- Bu adım henüz uygulanmadı; ekran görüntüsü yok. Domain, plan ve hazır Bench canlı doğrulama bekliyor.
- DNS gerekirse Hüseyin Cengiz kayıt türü/adı/değerini hazırlar, Asistan Hüseyin GoDaddy’de uygular, Hüseyin Cengiz HTTPS sonucunu doğrular.
- Administrator parolası veya başka secret değerleri rehberde yayımlanmaz; mevcut giriş bilgileri değiştirilmez.

Doğrulama: Site başarılı, HTTPS ve giriş çalışıyor, uygulama ekranları açılıyor; her biri ayrı doğrulama kanıtı gerektirir.

Bu adım için henüz ekran kanıtı yok.

## 15. Canlı Press ana ekranı

Giriş başarılı; mevcut bilgiler değiştirilmedi.

1. Sites, Benches ve Servers sayaçlarını oku.

Somut notlar:

- 10 aktif site, 1 aktif bench, birer app/database/proxy server gözlendi.
- Bu temiz görüntü mevcut kayıttan yeniden alındı; geçmişteki tıklama veya başarı anının tekrarı değildir.

Doğrulama: Mevcut altyapı kaydı okundu.

Açıklamalı ekran: [temiz ekran ve çerçeveler](https://karacaismail.github.io/pressguide/steps/live-press/)

## 16. Canlı hata: ERPNext eksik

Geçmiş kayıt: rgv1 / bench-0026 Apps tablosunda yalnız frappe ve educator bulunuyordu.

1. Kaynak uygulamasının gerçek adını kontrol et.
2. ERPNext bağımlılığını eklemeden yeni build başlatma.

Somut notlar:

- Ekran görüntüsü yayımlanmadı; bu, canlı oturumda kaydedilen geçmiş gözlemdir.
- Eski grup silinmedi; egitimxv1 / bench-0027 grubunda doğru beş uygulama kullanıldı.

Doğrulama: Geçmiş rgv1 tablosunda ERPNext yoktu; güncel bench-0027 tablosunda erpnext ikinci sıradadır.

Bu adım için henüz ekran kanıtı yok.

## 17. Canlı build sonucu: iki Failure

Geçmiş rgv1 denemesi: Preparing durumunun ardından iki build de Failure ile bitti.

1. Son build satırını aç.
2. Build Steps → Pre-build ayrıntısını incele.

Somut notlar:

- İlk build 1alh023bg7; ikinci build 2ae1i6en1o.
- Ekran görüntüsü yayımlanmadı; bu, canlı oturumda kaydedilen geçmiş gözlemdir.

Doğrulama: İki build durumunun Failure olduğu canlı oturumda okundu.

Bu adım için henüz ekran kanıtı yok.

## 18. Canlı hata çıktısı: Required app not found

Pre-build çıktısı eksik uygulamayı doğrudan ERPNext olarak belirtiyor.

1. Pre-build satırına tıkla.
2. Output alanındaki uygulama ve bağımlılık adlarını oku.

Somut notlar:

- Canlı çıktı: ('Required app not found', 'educator', 'erpnext').
- Klonlama başarılı; hata pre-build bağımlılık doğrulamasında.
- Ekran görüntüsü yayımlanmadı; bu, geçmiş rgv1 build’inin canlı oturumda okunan çıktısıdır.

Doğrulama: Eksik ERPNext canlı log ile doğrulandı.

Bu adım için henüz ekran kanıtı yok.

## 19. Dashboard New Site ekranı

Sites → New Site açıldı; framework version seçenekleri görünmedi.

1. Dedicated server seçeneğini kontrol et.
2. Desk ve hazır Bench verileriyle neden seçenek olmadığına bak.

Somut notlar:

- Ödeme yöntemi ekleme uyarısı ayrı konu; bu görevde ödeme yöntemi eklenmedi.
- Henüz site oluşturulmadı.
- Ekran görüntüsü yayımlanmadı; bu, canlı oturumda kaydedilen geçmiş gözlemdir.

Doğrulama: Versiyon seçeneklerinin boş olduğu canlı gözlendi.

Bu adım için henüz ekran kanıtı yok.

## 20. egitimxv1 grubu kaydedildi

Grup kimliği bench-0027; Team Administrator, Version 16, mevcut app sunucusu.

1. Release Group List içinde egitimxv1 kaydını aç; kayıt kimliğinin bench-0027 olduğunu kontrol et.
2. Title = egitimxv1, Team = Administrator ve Version = Version 16 alanlarını kontrol et; Servers tablosunda mevcut app sunucusunu seç.
3. Save ile kaydet. Yeni kayıt oluşturmak yerine sonraki Apps ve candidate işlemlerini bu bench-0027 kaydı üzerinde sürdür.

Somut notlar:

- bench-0027 Release Group kimliğidir; bu kaydın oluşması çalışan Bench veya Site oluştuğunu kanıtlamaz.
- Administrator burada kaynakların sahibi olan Team kaydıdır. Mevcut başka grupları veya çalışan siteleri değiştirmeden eğitim grubunda ilerle.
- Bu temiz görüntü mevcut kayıttan yeniden alındı; geçmişteki tıklama veya başarı anının tekrarı değildir.

Doğrulama: Kaydedilmiş formda Title, Team ve Version alanları okundu. Bu, çalışan Bench veya Site kanıtı değildir.

Açıklamalı ekran: [temiz ekran ve çerçeveler](https://karacaismail.github.io/pressguide/steps/live-saved/)

## 21. Runtime ayarları oluştu

Python 3.14, Node 24.12.0, Bench 5.28.0 ve Pip 25.3 kaydetme sonrası oluştu.

1. bench-0027 kaydında runtime alanlarını aç; Python 3.14, Node 24.12.0, Bench 5.28.0 ve Pip 25.3 değerlerini oku.
2. Deploy Candidate içindeki App Release commitlerini aç; her uygulamanın pyproject.toml ve ilgili sürüm gereksinimlerini bu runtime ayarlarıyla karşılaştır.
3. Build logunda kullanılan gerçek runtime ve kurulum sonucunu ayrıca kontrol et; yalnız form değerlerine bakarak build başarılı deme.

Somut notlar:

- Bu değerler grup kaydedildikten sonra oluşan yapılandırma alanlarıdır; sunucuda çalışan süreçlerin sürüm ölçümü değildir.
- Branch güncellenebilir. Uyumluluk incelemesini candidate içindeki sabit commitlere göre yap; çalışan sunucu paketlerini bu formu doldurmak için değiştirme.
- Bu temiz görüntü mevcut kayıttan yeniden alındı; geçmişteki tıklama veya başarı anının tekrarı değildir.

Doğrulama: Runtime değerleri form alanlarından okundu; build logundaki gerçek runtime ayrıca kontrol edilmeli.

Açıklamalı ekran: [temiz ekran ve çerçeveler](https://karacaismail.github.io/pressguide/steps/live-runtime/)

## 22. Doğru beş uygulama ve kaynak

frappe → erpnext → payments → education → lms. Check Dependent Apps açık.

1. bench-0027 → Apps tablosuna sırasıyla frappe, erpnext, payments, education ve lms satırlarını ekle.
2. Source alanlarını eşleştir: frappe → SRC-frappe-004; erpnext → SRC-erpnext-008; payments → SRC-payments-004; education → SRC-education-003; lms → SRC-lms-002.
3. Check Dependent Apps kutusunu açık tut. Save ile tabloyu kaydet ve kaydedilmiş beş satırı tekrar oku.

Somut notlar:

- frappe framework ilk sıradadır; education için erpnext, lms için payments gerekli olduğundan bağımlılıklar kendilerine ihtiyaç duyan uygulamalardan önce yer alır.
- Eski educator kaydını education satırında kullanma. Kaydedilmiş doğru tablo, bağımlılık hatasının giderildiği yönünde yapılandırma kanıtıdır; başarılı build kanıtı değildir.
- Bu temiz görüntü mevcut kayıttan yeniden alındı; geçmişteki tıklama veya başarı anının tekrarı değildir.

Doğrulama: Kaydedilmiş tabloda beş satırın her biri boş olmayan ve aynı ada sahip Source kaydına bağlı.

Açıklamalı ekran: [temiz ekran ve çerçeveler](https://karacaismail.github.io/pressguide/steps/live-correct-apps/)

## 23. Candidate oluşturuldu bildirimi

deploy-0027-000001 oluşturuldu. Bu bildirim build veya site başarısı değildir.

1. Kaydedilmiş egitimxv1 / bench-0027 grubunda Actions → Create Deploy Candidate seç.
2. Bildirimde oluşan deploy-0027-000001 bağlantısını aç; candidate kaydının doğru gruba bağlı olduğunu kontrol et.
3. Build başlatmadan önce candidate içindeki Apps & Deps ve App Release listesini incele.

Somut notlar:

- deploy-0027-000001 yeni eğitim grubunun candidate kimliğidir; eski bench-0026 candidate’ıyla karıştırma.
- Oluşturuldu bildirimi yalnız candidate kaydını doğrular. Build, deploy ve site oluşturma ayrı işlemlerdir.
- Bildirim ekranı yayımlanmadı; candidate menüsünün güncel görüntüsü live-candidate-menu adımındadır.

Doğrulama: Candidate kaydı bench-0027 grubuna bağlı olarak açıldı.

Bu adım için henüz ekran kanıtı yok.

## 24. Candidate release hashleri

Kaynaklar candidate içinde belirli commit hashlerine sabitlendi; Python/Frappe manifestleri bu commitlerden kontrol edildi.

1. deploy-0027-000001 kaydını aç; Apps & Deps içindeki frappe, erpnext, payments, education ve lms satırlarını kontrol et.
2. Her satırın App Release bağlantısını aç; kaynak kaydı ve commit hashini karşılaştır. Boş veya yanlış uygulamaya bağlı release varsa build başlatma.
3. Uyumluluk kontrolünde branch’in güncel ucunu değil, bu candidate’ın release commitlerindeki pyproject.toml ve hooks.py dosyalarını esas al.

Somut notlar:

- Candidate uygulama kaynaklarının belirli commitlerini bir araya getirir. Daha sonra branch değişmesi bu ekranda seçilmiş release hashinin aynı olduğu anlamına gelmez.
- Canlı oturumda candidate kaynakları ve commit manifestleri incelendi. Bu inceleme build/deploy sonucunun yerine geçmez.
- Bu temiz görüntü mevcut kayıttan yeniden alındı; geçmişteki tıklama veya başarı anının tekrarı değildir.

Doğrulama: Beş satırın her birinde Source, Release ve Hash alanı dolu; Source kimlikleri grup tablosuyla aynı.

Açıklamalı ekran: [temiz ekran ve çerçeveler](https://karacaismail.github.io/pressguide/steps/live-candidate-content/)

## 25. Build → Complete

Önce yalnız build başlatıldı; başarılı build görülmeden deploy yapılmadı.

1. deploy-0027-000001 sayfasında Build menüsünü aç ve Complete seçeneğini kullanarak yalnız build işlemini başlat.
2. Oluşan Deploy Candidate Build bağlantısını aç; bu oturumda yeni kayıt kpktsdsd9n olarak görüldü.
3. Build kaydında başarılı sonuç ve aşama logları görülmeden Deploy işlemini başlatma.

Somut notlar:

- Complete burada Build menüsündeki seçenek adıdır; build durumunun tamamlandığı veya başarılı olduğu anlamına gelmez.
- Bu oturumda yalnız build başlatıldı. Schedule Build and Deploy ile build ve deploy işlemlerini birlikte başlatma akışından farklıdır.
- Bu temiz görüntü mevcut kayıttan yeniden alındı; geçmişteki tıklama veya başarı anının tekrarı değildir.

Doğrulama: kpktsdsd9n build kaydı oluştu ve sonradan Failure ile bitti; deploy başlatılmadı.

Açıklamalı ekran: [temiz ekran ve çerçeveler](https://karacaismail.github.io/pressguide/steps/live-build-complete/)

## 26. Yeni build kaydı

kpktsdsd9n build kaydı Preparing olarak görüldü. Henüz başarı kanıtı değil.

1. Deploy Candidate Build listesinden kpktsdsd9n kaydını aç; candidate bağlantısının deploy-0027-000001 olduğunu kontrol et.
2. Status alanını, zaman damgalarını ve Build Steps aşamalarını oku. Bu oturumda görülen durum Preparing idi.
3. Preparing sürerse aynı kaydın loglarını incele; Failure oluşursa başarısız aşamayı ve Error Log bağlantısını aç. Sonuç görülmeden yeni buildleri peş peşe oluşturma.

Somut notlar:

- kpktsdsd9n build’in açılmış olması kuyruk veya hazırlık aşamasının gözlendiğini gösterir; başarılı image, deploy veya çalışan site kanıtı değildir.
- Sonraki kabul sırası: build başarılı sonucu → deploy sonucu → Bench hazır durumu → egitimxv1 site oluşturma. Bu kayıtta son üç aşama tamamlandı diye sunulmaz.
- Preparing anının ekranı yayımlanmadı; bu, canlı oturumda kaydedilen geçmiş gözlemdir. Güncel sonuç Failure; live-current-failure adımına bak.

Doğrulama: Build kaydının candidate bağlantısı deploy-0027-000001; daha sonra Failure ile bitti.

Bu adım için henüz ekran kanıtı yok.

## 27. Framework App Source

Canlı alanlar: frappe/frappe, version-16, Frappe checkbox açık. Alttaki installation alanı yayımlanan kırpımın dışında.

1. Apps tablosunda frappe satırının SRC-frappe-004 Source bağlantısını aç.
2. App = frappe, Repository = frappe/frappe ve Branch = version-16 alanlarını kontrol et; framework kaynağında Frappe checkbox açık olmalı.
3. Kaynak kimliğini grup satırıyla karşılaştır; diğer uygulamaların satırlarına bu framework source kaydını bağlama.

Somut notlar:

- Frappe checkbox yalnız framework olan frappe kaynağında açık tutulur; eğitim uygulamalarını framework olarak işaretleme.
- Yayımlanan görsel yalnız gereken repo/branch alanlarını gösterir; installation ve erişim bilgileri dokümana taşınmaz.
- Bu temiz görüntü mevcut kayıttan yeniden alındı; geçmişteki tıklama veya başarı anının tekrarı değildir.

Doğrulama: App, Repository URL ve Branch alanları grup tablosundaki SRC-frappe-004 satırıyla eşleşiyor.

Açıklamalı ekran: [temiz ekran ve çerçeveler](https://karacaismail.github.io/pressguide/steps/live-framework-source/)

## 28. ERPNext App Source

Canlı DOM: frappe/erpnext reposu version-16. Education için gerekli uygulama.

1. Apps tablosunda erpnext satırının SRC-erpnext-008 Source bağlantısını aç.
2. App = erpnext, Repository = frappe/erpnext ve Branch = version-16 eşleşmesini kontrol et.
3. education satırından önce erpnext satırının gruba eklendiğini ve kaydedildiğini doğrula.

Somut notlar:

- Education’ın required_apps kaydı ERPNext gerektirir. Eski build’de Required app not found hatasının eksik uygulaması erpnext idi.
- ERPNext source seçimi bağımlılığı gruba ekler; ERPNext’in kurulup çalıştığı ayrıca başarılı build ve site app listesiyle doğrulanır.
- Bu temiz görüntü mevcut kayıttan yeniden alındı; geçmişteki tıklama veya başarı anının tekrarı değildir.

Doğrulama: SRC-erpnext-008 kaynağı App = erpnext ve version-16 ile grup tablosunda education satırından önce.

Açıklamalı ekran: [temiz ekran ve çerçeveler](https://karacaismail.github.io/pressguide/steps/live-erpnext-source/)

## 29. Payments App Source

Canlı alanlar: frappe/payments reposu version-16; LMS için gerekli uygulama.

1. Apps tablosunda payments satırının SRC-payments-004 Source bağlantısını aç.
2. App = payments, Repository = frappe/payments ve Branch = version-16 alanlarını kontrol et.
3. lms satırından önce payments satırını ekle; Apps tablosunu Save ile kaydet.

Somut notlar:

- Bu candidate’taki LMS uygulaması payments bağımlılığı gerektirir; ödeme yöntemi ekleme uyarısı ile bu uygulama bağımlılığı farklı konulardır.
- Bu adım Git kaynak eşleşmesidir; bir ödeme hesabı açma, kart bilgisi girme veya ödeme alma işlemi yapılmaz.
- Bu temiz görüntü mevcut kayıttan yeniden alındı; geçmişteki tıklama veya başarı anının tekrarı değildir.

Doğrulama: SRC-payments-004 kaynağı App = payments ve version-16 ile grup tablosunda lms satırından önce.

Açıklamalı ekran: [temiz ekran ve çerçeveler](https://karacaismail.github.io/pressguide/steps/live-payments-source/)

## 30. Education App Source

Canlı DOM: education, frappe/education, version-16. educator adı kullanılmadı.

1. Apps tablosunda education satırının SRC-education-003 Source bağlantısını aç.
2. App = education, Repository = frappe/education ve Branch = version-16 alanlarını kontrol et.
3. Teknik uygulama adının education olduğunu ve ERPNext satırının önce geldiğini doğrula; eski educator kaydını bu satırda seçme.

Somut notlar:

- education repo içindeki gerçek paket adıdır. Title alanının okunabilir olması yanlış bir App teknik adını düzeltmez.
- Eski educator kaydı bu eğitim grubunda kullanılmadı; mevcut bağlantıları incelenmeden eski kayıt silinmez veya yeniden adlandırılmaz.
- Bu temiz görüntü mevcut kayıttan yeniden alındı; geçmişteki tıklama veya başarı anının tekrarı değildir.

Doğrulama: SRC-education-003 kaynağının App alanı education; grup tablosunda erpnext satırından sonra.

Açıklamalı ekran: [temiz ekran ve çerçeveler](https://karacaismail.github.io/pressguide/steps/live-education-source/)

## 31. LMS App Source

Canlı alanlar: frappe/lms reposu main branch. Required Apps: frappe/payments. Her app branch’i version-16 olmak zorunda değil.

1. Apps tablosunda lms satırının SRC-lms-002 Source bağlantısını aç.
2. App = lms, Repository = frappe/lms ve Branch = main alanlarını kontrol et; bu kayıtta gözlenen branch main idi.
3. Required Apps içindeki frappe ve payments değerlerini kontrol et; ikisinin de Apps tablosunda lms satırından önce bulunduğunu doğrula.

Somut notlar:

- Her uygulamaya otomatik olarak version-16 branch yazılmaz. Bu LMS kaynağının main branch uyumluluğu candidate’taki seçilmiş commit üzerinden incelenir.
- Education ve LMS ayrı uygulamalardır; bu grupta her ikisi kendi kaynak ve bağımlılıklarıyla yer alır.
- Bu temiz görüntü mevcut kayıttan yeniden alındı; geçmişteki tıklama veya başarı anının tekrarı değildir.

Doğrulama: SRC-lms-002 kaynağı main branch’ine bağlı; frappe ve payments grup tablosunda lms satırından önce.

Açıklamalı ekran: [temiz ekran ve çerçeveler](https://karacaismail.github.io/pressguide/steps/live-lms-source/)

## 32. Dashboard bench listesi

Mevcut geniş uygulama grubu Active; rgv1 ve eğitim grubu Awaiting Deploy idi. Bu ekran site oluşturma başarısı değildir.

1. Press Dashboard → Benches listesini aç; mevcut Active kaydı ile rgv1 ve egitimxv1 eğitim grubunu ayrı satırlar olarak oku.
2. egitimxv1 satırının durumunu kontrol et; bu oturumda Awaiting Deploy görüldü.
3. Site oluşturmayı denemeden önce eğitim grubunun kendi build ve deploy sonucunu doğrula; mevcut Active gruba taşınarak sorunu gizleme.

Somut notlar:

- Mevcut başka bir Bench’in Active olması yeni eğitim grubunun hazır olduğu anlamına gelmez.
- Awaiting Deploy gözlenen durumdur; egitimxv1 için hazır Bench veya oluşturulmuş site kanıtı henüz yoktur.
- Ekran görüntüsü yayımlanmadı; bu, canlı oturumda kaydedilen geçmiş gözlemdir.

Doğrulama: egitimxv1 satırı Active değil; site oluşturma için hazır Bench yok.

Bu adım için henüz ekran kanıtı yok.

## 33. Dashboard New Bench sürüm seçenekleri boş

New Bench ekranında framework version seçenekleri görünmedi. Desk üzerinden doğru grup oluşturma yoluna geçildi.

1. Dashboard → Benches → New Bench akışını aç ve framework version seçim alanını kontrol et.
2. Bu oturumda seçenekler boş görüldü. Seçim varmış gibi ilerleme; Desk aramasından Release Group List açarak doğru egitimxv1 grubunu oluşturma yolunu kullan.
3. Desk’teki bench-0027, candidate deploy-0027-000001 ve build kpktsdsd9n kayıtlarıyla ilerle; Dashboard seçeneklerini build/deploy sonucu sonrasında yeniden kontrol et.

Somut notlar:

- Boş seçenek listesinin nedeni kesinleştirilmedi. Framework source, Team paylaşımı ve hazır Bench verileri ayrı inceleme gerektirir.
- New Bench formunun açılması Bench veya Site oluşturmaz; bu oturumda bu boş formdan kayıt oluşturulmadı.
- Ekran görüntüsü yayımlanmadı; bu, canlı oturumda kaydedilen geçmiş gözlemdir.

Doğrulama: Boş Dashboard formundan kayıt oluşturulmadı; eğitim grubu Desk’te bench-0027 olarak kaydedildi.

Bu adım için henüz ekran kanıtı yok.

## 34. Agent temel bağlantısı: pong

Server → app → Ping → Ping Agent işlemi pong yanıtı verdi. Temel erişim çalışıyor; build protokolü ayrıca doğrulanmalı.

1. Server List içinde app sunucusunu aç; Ping → Ping Agent işlemini çalıştır ve yanıtı oku.

Somut notlar:

- Ekran görüntüsü yayımlanmadı; bu, canlı oturumda kaydedilen geçmiş gözlemdir. Başarılı build veya site kurulumu anlamına gelmez.

Doğrulama: Yanıt pong. Upload ve build endpoint’leri bu kontrolle doğrulanmaz.

Bu adım için henüz ekran kanıtı yok.

## 35. Agent commit kimliği

Server → Actions → Show Agent Version: 2a412bc2b1292176f0b6c8ea51240d743981f283. Bu repo HEAD bilgisidir; çalışan process kodu ayrıca SSH ile doğrulanmalı.

1. Aynı Server kaydında Actions → Show Agent Version seç ve gösterilen commit kimliğini kaydet.

Somut notlar:

- Show Agent Version repo HEAD bilgisidir. Aynı sunucudaki 7 Ekim 07:27 başarılı filename build’i, çalışan servisin eski protokolü desteklediğini gösterir. Sürüm uyuşmazlığı kök neden olarak doğrulanmadı; çalışan dosyalar ve yüklenen Python kodu ayrıca incelenmeli.
- Ekran görüntüsü yayımlanmadı; bu, canlı oturumda kaydedilen geçmiş gözlemdir.

Doğrulama: Commit kimliği kaydedildi; çalışan process kodu henüz SSH ile doğrulanmadı.

Bu adım için henüz ekran kanıtı yok.

## 36. Press yönetim uygulamasının sürümü

Help → About: Press 0.7.0 (develop), yönetim Framework 15.101.5 (version-15). Bu yönetim paneli sürümü; hedef eğitim grubunun Frappe v16 sürümünden ayrıdır.

1. Desk üst menüsünde Help → About aç; Press ve Framework sürümlerini kaydet.

Somut notlar:

- Ekran görüntüsü yayımlanmadı; bu, canlı oturumda kaydedilen geçmiş gözlemdir.

Doğrulama: Yönetim paneli version-15 üzerinde; eğitim grubunun Version 16 hedefiyle karıştırılmadı.

Bu adım için henüz ekran kanıtı yok.

## 37. Yeni eğitim build genel sonucu: Failure

kpktsdsd9n build genel durumu Failure. Bu kırpım clone satırlarını gösterir; Upload hatasının ayrıntısı bir sonraki kanıttadır.

1. Deploy Candidate Build listesinden kpktsdsd9n kaydını aç; Status alanını ve Build Steps tablosunun başını oku.

Somut notlar:

- Bu ekran belirli bir anın kanıtıdır; başarılı site kurulumu anlamına gelmez.
- Bu temiz görüntü mevcut kayıttan yeniden alındı; geçmişteki tıklama veya başarı anının tekrarı değildir.

Doğrulama: Status Failure; deploy ve site oluşturma başlatılmadı.

Açıklamalı ekran: [temiz ekran ve çerçeveler](https://karacaismail.github.io/pressguide/steps/live-current-failure/)

## 38. Build paketinin yüklenmesi başarısız

Build Steps satır 8: Stage Upload, Step Build Context, Status Failure. Beş clone, Pre-build ve Package satırları Success.

1. Build kaydında Build Steps → 8. Upload / Build Context satırını aç.

Somut notlar:

- Bu ekran belirli bir anın kanıtıdır; başarılı site kurulumu anlamına gelmez.
- Bu temiz görüntü mevcut kayıttan yeniden alındı; geçmişteki tıklama veya başarı anının tekrarı değildir.

Doğrulama: İlk Failure satırı Upload / Build Context; sonraki satırlar Pending.

Açıklamalı ekran: [temiz ekran ve çerçeveler](https://karacaismail.github.io/pressguide/steps/live-upload-row/)

## 39. HTTP 500: agent upload yanıtı

Error Log qu5n7pv6pk: POST builder/upload/kpktsdsd9n yanıtı HTTP 500; yanıt JSON olarak çözümlenemedi.

1. Build → Error Log → Deploy Candidate Build Exception kaydını aç; response ve path satırlarını oku.

Somut notlar:

- BufferedReader hatası traceback değişkenlerinin yazdırılmasında oluşuyor; birincil HTTP 500 hatasıyla karıştırma.
- Ekran görüntüsü yayımlanmadı; Error Log secret içerebileceği için yalnız metin olarak kaydedildi.

Doğrulama: Birincil hata agent upload yanıtındaki HTTP 500; nedeni sunucu loglarıyla henüz doğrulanmadı.

Bu adım için henüz ekran kanıtı yok.

## 40. Eski build Pre-build aşamasında durmuş

Eski rgv1 grubunda Pre-build Failure gözlendi. Güncel egitimxv1 build’i bu aşamayı geçti; iki hatayı karıştırma.

1. Eski ve güncel build kayıtlarında ilk Failure satırının Stage/Step değerlerini yan yana karşılaştır.

Somut notlar:

- Ekran görüntüsü yayımlanmadı; bu, canlı oturumda kaydedilen geçmiş gözlemdir.

Doğrulama: Eski hata Pre-build (Required app not found); güncel hata Upload / Build Context.

Bu adım için henüz ekran kanıtı yok.

## 41. Eski candidate build sayısı

deploy-0026-000001 eski candidate kaydında iki build bağlantısı bulunuyor. Yeni candidate deploy-0027-000001 ayrı kayıttır.

1. Candidate kaydının Connections bölümünde bağlı build sayısını oku; build kimliklerini candidate kimliğiyle eşleştir.

Somut notlar:

- Ekran görüntüsü yayımlanmadı; bu, canlı oturumda kaydedilen geçmiş gözlemdir.

Doğrulama: Eski candidate’ın iki buildi (1alh023bg7, 2ae1i6en1o) güncel kpktsdsd9n build’inden ayrı.

Bu adım için henüz ekran kanıtı yok.

## 42. Eski candidate liste görünümü

Eski rgv1 candidate listesi deploy-0026-000001 kaydını gösteriyor; build/site başarısını göstermez.

1. Deploy Candidate listesini Release Group alanına göre filtrele; her candidate’ın hangi gruba ait olduğunu oku.

Somut notlar:

- Ekran görüntüsü yayımlanmadı; bu, canlı oturumda kaydedilen geçmiş gözlemdir.

Doğrulama: deploy-0026-000001 eski rgv1 grubuna, deploy-0027-000001 egitimxv1 grubuna ait.

Bu adım için henüz ekran kanıtı yok.

## 43. Release Group candidate menüsü

Kaydedilmiş grupta Actions → Create Deploy Candidate seçeneği görünür. egitimxv1 için aynı işlem deploy-0027-000001 kaydını üretti.

1. Kaydedilmiş egitimxv1 / bench-0027 grubunda Actions menüsünü aç; Create Deploy Candidate ile Create Duplicate Deploy Candidate seçeneklerini ayırt et.

Somut notlar:

- Görselde menü açık; bu çekimde yeni candidate oluşturulmadı. Başarılı site kurulumu anlamına gelmez.
- Bu temiz görüntü mevcut kayıttan yeniden alındı; geçmişteki tıklama veya başarı anının tekrarı değildir.

Doğrulama: Menüde Create Deploy Candidate görünüyor; daha önceki kullanımı deploy-0027-000001 kaydını üretti.

Açıklamalı ekran: [temiz ekran ve çerçeveler](https://karacaismail.github.io/pressguide/steps/live-candidate-menu/)

## 44. Mevcut grupları ayırt et

Release Group listesinde önceki eğitim denemesi ve çalışan geniş uygulama grubu ayrıdır. Eğitim için yeni egitimxv1 / bench-0027 kaydı oluşturuldu.

1. Release Group List aç; Title ve kayıt kimliği sütunlarıyla eski rgv1, çalışan geniş grup ve egitimxv1 satırlarını ayırt et.

Somut notlar:

- Çalışan siteleri barındıran grubu eğitim denemesi için düzenleme.
- Ekran görüntüsü yayımlanmadı; bu, canlı oturumda kaydedilen geçmiş gözlemdir.

Doğrulama: Eğitim işlemleri yalnız bench-0027 üzerinde yapıldı; diğer gruplar değiştirilmedi.

Bu adım için henüz ekran kanıtı yok.

## 45. Taslak formda runtime alanları

Yeni grup taslağında Dependencies tablosu boştu. Kaydetme sonrası runtime alanları oluştu; live-runtime adımına bak.

1. Taslak grupta Dependencies tablosunu elle doldurma; önce Save ile kaydet, sonra runtime alanlarını oku.

Somut notlar:

- Ekran görüntüsü yayımlanmadı; bu, canlı oturumda kaydedilen geçmiş gözlemdir.

Doğrulama: Kaydetme sonrası değerler live-runtime adımında okundu.

Bu adım için henüz ekran kanıtı yok.

## 46. Site formunun ilk görünümü

Sites → New Site ilk ekranında framework sürüm seçenekleri görünmedi. Dedicated server seçimiyle de ayrıca kontrol edildi; site oluşturulmadı.

1. Dashboard → Sites → New Site aç; framework sürüm alanını önce varsayılan, sonra Dedicated server seçimiyle kontrol et.

Somut notlar:

- Ekran görüntüsü yayımlanmadı; bu, canlı oturumda kaydedilen geçmiş gözlemdir.

Doğrulama: Her iki durumda seçenek görünmedi; site oluşturulmadı.

Bu adım için henüz ekran kanıtı yok.

## 47. Eski grup kimliği: rgv1

Bu kaydın Title alanı rgv1. Kullanıcı tarafından seçilen yeni ad egitimxv1; eski kayıt yeniden adlandırılmadı.

1. Eski bench-0026 kaydını aç; Title alanını oku ve kaydı yeniden adlandırma.

Somut notlar:

- Ekran görüntüsü yayımlanmadı; bu, canlı oturumda kaydedilen geçmiş gözlemdir.

Doğrulama: Eski kayıt rgv1 adıyla korunuyor; yeni ad egitimxv1 ayrı bench-0027 kaydında.

Bu adım için henüz ekran kanıtı yok.

## 48. Sites ekranında ödeme uyarısı

Sites başlığındaki ödeme yöntemi uyarısı görüldü. Bu görevde ödeme yöntemi eklenmedi; build agent hatasının nedeni bu uyarı olarak kabul edilmedi.

1. Dashboard → Sites başlığındaki uyarıyı oku; ödeme yöntemi ekleme işlemini başlatma.

Somut notlar:

- Ekran görüntüsü yayımlanmadı; bu, canlı oturumda kaydedilen geçmiş gözlemdir.

Doğrulama: Ödeme yöntemi eklenmedi; uyarı ile build Upload hatası arasında bağlantı kanıtlanmadı.

Bu adım için henüz ekran kanıtı yok.

## 49. Preparing sırasında hata filtresi boştu

Build → Error Log bağlantısındaki reference_name=kpktsdsd9n filtresi o anda eşleşen kayıt bulmadı. Daha sonra Failure olduğunda qu5n7pv6pk kaydı oluştu.

1. Build kaydında Connections → Error Log bağlantısını aç; reference_name filtresinin build kimliğiyle eşleştiğini kontrol et.

Somut notlar:

- Ekran görüntüsü yayımlanmadı; bu, canlı oturumda kaydedilen geçmiş gözlemdir.

Doğrulama: Preparing sırasında boş olan filtre, Failure sonrasında qu5n7pv6pk kaydını gösterdi.

Bu adım için henüz ekran kanıtı yok.

## 50. Preparing sırasında Agent Job filtresi

Build → Agent Job bağlantısındaki reference_name=kpktsdsd9n filtresi o anda boştu. Bu, sistemde hiç Agent Job olmadığı anlamına gelmez.

1. Build kaydında Connections → Agent Job bağlantısını aç; filtreyi kaldırıp Run Remote Builder işlerini tarih ve Server ile ayrıca listele.

Somut notlar:

- Ekran görüntüsü yayımlanmadı; bu, canlı oturumda kaydedilen geçmiş gözlemdir.

Doğrulama: Filtreli liste boştu; filtresiz listede başka builder işleri bulundu (live-agent-jobs).

Bu adım için henüz ekran kanıtı yok.

## 51. Build hatasında nereye bakılır?

Preparing veya Failure durumunda uygulama listesine dönmeden önce build aşamasını ve ilgili logu belirle. Bu kurulumda iki farklı hata ayrı kanıtlarla bulundu.

1. Release Group → Deploy Candidate → Deploy Candidate Build kaydını aç. Grup, candidate, build kimliğini ve zaman damgasını kaydet; egitimxv1 için bench-0027 / deploy-0027-000001 / kpktsdsd9n.
2. Build Steps tablosunda ilk Failure satırını bul. Sonraki Pending satırlar çoğunlukla henüz başlamamış adımlardır; ayrı hata sanma.
3. Run Validations → Pre-build Failure ise satırı açıp Output alanını oku. Required app not found çıktısında istenen bağımlılığı gerçek App/Source ve uyumlu branch ile ekle. Eski educator denemesinde eksik app erpnext idi.
4. Upload → Build Context Failure ise build Connections → Error Log bağlantısını aç. Deploy Candidate Build Exception kaydında request method, path ve response koduna bak. Güncel kanıt qu5n7pv6pk: POST builder/upload/kpktsdsd9n → HTTP 500.
5. Traceback sonunda JSONDecodeError varsa daha önceki response satırını oku. HTTP 500 birincil hata; JSONDecodeError yanıtın JSON olarak çözümlenemediğini belirtir. BufferedReader cannot pickle ise traceback değişkenini yazdırırken oluşmuş ikincil hatadır.
6. Server List → ilgili Build Server → Ping → Ping Agent ile bağlantıyı kontrol et. pong, temel bağlantıyı doğrular; upload veya build protokolünün doğru olduğunu kanıtlamaz.
7. Aynı Server → Actions → Show Agent Version ile agent commit’ini; Help → About ile yönetim paneli Frappe/Press sürümünü kaydet. Hedef grubun v16 uygulama sürümlerini yönetim panelinin v15 Framework sürümüyle karıştırma.
8. Agent Job → Run Remote Builder kayıtlarını tarih ve Reference Name ile eşleştir. 5ignfoq0t5 kaydında 6 Ekim tarihli Redis AOF / No space left on device hatası var. Bugünkü upload 500 için disk/inode ve güncel Redis persistence durumu ayrıca kontrol edilmeli.
9. Clone, bağımlılık kontrolü ve paketleme Success iken agent POST 500 veriyorsa Hüseyin Cengiz agent/proxy traceback’ini, gerçek çalışan process kodunu ve Press commit’ini sunucuda inceler. Repo HEAD bilgisi çalışan process sürümünü tek başına kanıtlamaz.
10. Preparing sırasında Error Log veya Agent Job filtreleri boş olabilir. Bu kurulumda üç upload denemesi ve aradaki toplam 600 saniye bekleme Preparing süresini açıkladı. Kayıt oluşmadan tekrar build başlatma.
11. Agent Job, RQ Job ve Error Log filtrelerinin kapsamını kontrol et. No matching records yalnız seçili filtrede kayıt olmadığını söyler; sistemde hiçbir iş veya hata yok demek değildir. Scheduler Active de build endpoint sağlığını kanıtlamaz.
12. Uyumlu sürüm çifti ve geri dönüş planı doğrulandıktan sonra düzeltmeyi uygula; ardından tek build ile clone → validation → package → upload → image build/push Success akışını doğrula. Sonra deploy/Bench ve en son egitimxv1 sitesinin HTTPS, giriş ve app ekranlarını doğrula.

Somut notlar:

- Agent Job listesinde başka başarılı builder işleri var. 333inegvf4 bugün 07:27’de filename protokolüyle Success; bu karşı örnek nedeniyle önceki güçlü protokol uyuşmazlığı çıkarımı geri çekildi.
- Press Settings → Branch global bir ayardır. Use for Build kutusu endpoint oluşturmaz. Update Agent veya Ansible düğmesine rastgele basma; servis etkisi ve geri dönüş planı incelenmeli.
- Sadece upload endpoint’ini içeren eski bir commit seçmek yeterli değildir: build endpoint’inin filename/Dockerfile sözleşmesi de uyumlu olmalı. Bu yüzden doğrulanmamış SHA’yı branch alanına yazmak çözüm değildir.
- Secret içerebilen tam traceback, agent tokenları, config veya özel anahtarlar public rehbere aktarılmaz. Buradaki ekranlar görünür veri incelemesinden geçirildi.
- Teknik düzeltme sahibi Hüseyin Cengiz. DNS gerekirse kayıt gereksinimini Hüseyin Cengiz hazırlar, GoDaddy uygulamasını Asistan Hüseyin yapar.
- SSH port 5055 iki denemede kimlik doğrulamadan önce Connection reset by peer ile kesildi. Şifre denenmedi; sunucuda değişiklik yapılmadı.

Doğrulama: Hatanın ilk başarısız aşaması, esas HTTP/log mesajı ve sürüm kanıtları ayrı kaydedildi. Sunucu düzeltmesi, başarılı build/deploy ve çalışan site henüz doğrulanmadı.

Bu adım için henüz ekran kanıtı yok.

## 52. Agent Job listesini doğru yorumla

Listede hem başarılı backup/build işleri hem de önceki Failure kayıtları var. Kayıtları ilgili build kimliği ve zamanıyla eşleştir.

1. Agent Job listesini aç.
2. Job Type olarak Run Remote Builder seç; Server ve Reference Name alanlarını kontrol et.
3. 333inegvf4: 7 Ekim 07:27:45–07:28:22, Success; reference 2orrvq4bjk. Bu egitimxv1 işi değil.

Somut notlar:

- İstek gövdesinde registry parolası veya build token bulunabilir. Ham Request Data ekranını public rehbere koyma.
- Başka işin Success olması kpktsdsd9n upload hatasını ortadan kaldırmaz.

Doğrulama: 333inegvf4 job POST builder/build ile filename parametresini kullanmış; eski protokol canlı serviste destekleniyor.

Açıklamalı ekran: [temiz ekran ve çerçeveler](https://karacaismail.github.io/pressguide/steps/live-agent-jobs/)

## 53. Başarılı builder karşı örneği

7 Ekim’deki başka bir başarılı builder işi önceki sürüm uyuşmazlığı çıkarımını sınırlar.

1. 333inegvf4 job kaydını aç.
2. Status, Request Path ve Reference Name bilgilerini birlikte kontrol et.

Somut notlar:

- Repo HEAD ile çalışan process kodu aynı olmayabilir.
- Bu kayıt egitimxv1 build’inin başarılı olduğuna kanıt değildir.

Doğrulama: Success; POST builder/build; reference 2orrvq4bjk.

Açıklamalı ekran: [temiz ekran ve çerçeveler](https://karacaismail.github.io/pressguide/steps/live-builder-success/)

## 54. Önceki hata: Redis AOF için disk alanı yok

5ignfoq0t5 job traceback’i Redis AOF dosyasına yazımda No space left on device hatasını gösteriyor.

1. 5ignfoq0t5 job kaydında Traceback alanının son satırını oku.
2. Hüseyin Cengiz disk alanı, inode ve Redis AOF durumunu salt okunur olarak kontrol etsin.
3. 7 Ekim upload hatası zamanındaki agent ve proxy loglarıyla karşılaştır.

Somut notlar:

- Bu hata 6 Ekim 18:47–18:59 işine ait; bugünkü HTTP 500’ün aynı nedenle oluştuğu kanıtlanmadı.
- Disk temizleme, backup silme, Docker prune veya Redis AOF silme uygulanmadı. Aktif siteler korunuyor.
- Çekim Request Data ve token alanlarını dışarıda bırakacak şekilde kırpıldı.

Doğrulama: redis.exceptions.ResponseError: MISCONF Errors writing to the AOF file: No space left on device.

Açıklamalı ekran: [temiz ekran ve çerçeveler](https://karacaismail.github.io/pressguide/steps/live-redis-enospc/)

## Kaynaklar

- [Education v16: app_name ve required_apps](https://github.com/frappe/education/blob/version-16/education/hooks.py)
- [Press App Source uygulaması](https://github.com/frappe/press/blob/develop/press/press/doctype/app_source/app_source.py)
- [Frappe Press resmî kaynak kodu](https://github.com/frappe/press)
- [Astro: GitHub Pages dağıtımı](https://docs.astro.build/en/guides/deploy/github/)
- [ERPNext v16 runtime gereksinimleri](https://github.com/frappe/erpnext/blob/version-16/pyproject.toml)
- [Payments v16 runtime gereksinimleri](https://github.com/frappe/payments/blob/version-16/pyproject.toml)
- [LMS v16 bağımlılıkları](https://github.com/frappe/lms/blob/version-16/lms/hooks.py)
- [Bildirilen agent commit’i: builder route’ları](https://github.com/frappe/agent/blob/2a412bc2b1292176f0b6c8ea51240d743981f283/agent/web.py)
- [Agent sürüm bilgisinin kaynağı](https://github.com/frappe/agent/blob/2a412bc2b1292176f0b6c8ea51240d743981f283/agent/server.py#L1018)
- [Agent güncellemesinde branch ve upstream sözleşmesi](https://github.com/frappe/agent/blob/2a412bc2b1292176f0b6c8ea51240d743981f283/agent/server.py#L873)
