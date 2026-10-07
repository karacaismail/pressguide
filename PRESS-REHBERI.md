# Press kullanım rehberi

Güncelleme: 7 Ekim 2026 — egitimxv1.metaframer.net Active; HTTPS (HTTP/2 200, geçerli TLS) doğrulandı; ilk kurulum tamamlandı (setup_complete=1); Desk, Eğitim, LMS, CRM ve ERPNext ekranlarının açıldığı doğrulandı

egitimxv1.metaframer.net Active. Build 28/28 Success; bench ve site kurulumu başarılı. HTTPS, giriş, ilk kurulum ve altı uygulamanın kurulumu doğrulandı; Desk, Eğitim, LMS, CRM ve ERPNext başlangıç ekranları açıldı. Mevcut siteler ve bench-0022 uygulamaları korundu. Press Daily Usage hatası düzeltildi; log servisi tanımlı olmadığı için grafik No data gösteriyor. Gerçek iş süreçleri ve entegrasyonlar test edilmedi. Ayrıntılar aşağıdaki canlı kanıt adımlarında.

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
- Bu beş satırlık çekim CRM eklenmeden önceki tarihsel görüntüdür. Güncel altı satırlık tablo live-cleanup-crm adımındadır.
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
- Bu beş satırlık çekim CRM eklenmeden önceki tarihsel görüntüdür; crm → SRC-crm-002 satırı live-cleanup-crm adımında görünür.
- SRC isimlerini bu kurulumdan kopyalamak yerine kendi kayıtlarının repo/branch alanlarını incele.
- Bu temiz görüntü mevcut kayıttan yeniden alındı; geçmişteki tıklama veya başarı anının tekrarı değildir.

Doğrulama: Apps tablosunda boş Source veya yanlış App kimliği bulunmamalı.

Açıklamalı ekran: [temiz ekran ve çerçeveler](https://karacaismail.github.io/pressguide/steps/source-selection/)

## 11. Create Deploy Candidate

Deploy Candidate, grup uygulama release’lerinin build için seçilmiş anlık kümesidir.

1. Kaydedilmiş doğru grupta Actions → Create Deploy Candidate.
2. Yeni candidate bağlantısını aç; Apps & Deps listesini incele.

Somut notlar:

- Görsel egitimxv1 / bench-0027 grubunun Actions menüsünü gösterir. Bu grupta Create Deploy Candidate önce deploy-0027-000001, CRM eklendikten sonra deploy-0027-000002 kaydını üretti; eski rgv1 / bench-0026 grubu ayrı kayıttır.
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
- Bu kurulumda kpktsdsd9n build’i Failure ile bitti; deploy yapılmadı. Disk temizliğinden sonra deploy-0027-000002 için yalnız Build → Complete başlatıldı; ilk build f476t39m7i Pre-build validation’da Failure ile bitti (npm aralığı ayrıştırma). Hedefli Press düzeltmesinden sonra build j8vu7j2qnm 27 adımı Success geçti, ancak son adım Upload Docker Image’da Failure ile bitti (ECR deposu eksikti). Yalnız hedef depo oluşturulduktan sonra yeni build qoh3rkif10 28/28 adım Success ile bitti. Deploy ancak bundan sonra, Deploy → Deploy ile bir kez başlatıldı (deploy-0027-000002); yeni bench önce Installing, sonra Active oldu (live-bench-active). Site oluşturuldu ve Active; HTTPS ve giriş ekranı doğrulandı (live-site-active-apps, live-site-https-login).
- Schedule Build and Deploy ikisini birlikte başlatır; mevcut çalışan siteleri barındıran grupta deploy, migration ve yeniden başlatma etkisi taşıyabilir.
- Bu temiz görüntü mevcut kayıttan yeniden alındı; geçmişteki tıklama veya başarı anının tekrarı değildir.

Doğrulama: Yeni build kaydı oluşmalı ve Success olmalı; deploy ancak bundan sonra ayrı başlatılır. Bu kurulumda deploy yalnız qoh3rkif10 Success sonrasında başlatıldı; yeni bench bench-0027-000002-apphtznr Active ve New Bench Agent Job tgajt4obnu Success olarak okundu (live-bench-active).

Açıklamalı ekran: [temiz ekran ve çerçeveler](https://karacaismail.github.io/pressguide/steps/schedule/)

## 13. Preparing: çalışıyor mu?

Geçmiş denemede build yalnız Preparing durumunda görüldü; bu durum başarılı build, deploy veya site kanıtı değildir. Bu adımın yayımlanmış ekranı yok.

1. Build satırını aç, zaman damgası ve aşama loglarını oku.
2. Error Log bağlantısını ve candidate Apps & Deps listesini incele.
3. Preparing uzun sürüyorsa Press worker/scheduler ve build server görevlerini Hüseyin Cengiz’e kanıtlarıyla aktar.
4. Başarılı build sonrasında Deploy ve Bench kaydını ayrıca doğrula.

Somut notlar:

- Yalnız Preparing durumuna bakarak kurulum çalışıyor deme. Hata türü belirlenmeden tekrar tekrar yeni build açma.
- Geçmiş rgv1 denemesinde iki build Failure bulundu; live-error adımına bak. İlk egitimxv1 build’i kpktsdsd9n de Failure; hata-tanisi adımına bak. deploy-0027-000002’nin ilk build’i f476t39m7i Pre-build validation Failure; live-npm-range-validation adımına bak. Sonraki build j8vu7j2qnm 13:39:11 TSİ’de başladı; Running iken Pre-build, Package ve Upload Build Context Success görüldü (live-prebuild-upload-success), ardından son adım Upload Docker Image’da Failure ile bitti (live-ecr-push-failure). Yeni build qoh3rkif10 28/28 adım Success ile bitti (live-build-success).

Doğrulama: Build başarılı, deploy başarılı ve ilgili Bench hazır olmadan Site adımına geçme.

Bu adım için henüz ekran kanıtı yok.

## 14. Eğitim sitesini oluştur ve doğrula

egitimxv1 sitesi henüz oluşturulmadı. İlk build disk doluluğu nedeniyle Upload Build Context adımında başarısız oldu; onaylı build cache temizliği yapıldı (disk %48). deploy-0027-000002’nin ilk build’i f476t39m7i npm aralığı ayrıştırma hatasıyla Pre-build’de başarısız oldu; hedefli düzeltme sonrası j8vu7j2qnm 27 adımı geçip son adım Upload Docker Image’da Failure ile bitti (ECR deposu eksikti). Eksik depo oluşturuldu; yeni build qoh3rkif10 28/28 Success ve image ECR’de doğrulandı. Deploy deploy-0027-000002 başlatıldı; yeni bench bench-0027-000002-apphtznr önce Installing, sonra Active oldu (live-bench-active). Site oluşturma gönderildi; form önce Creating site... This may take a while... gösterdi, site satırı bir süre Installing kaldı. Şimdi egitimxv1.metaframer.net Active: New Site Agent Job 2sdhhleqvr çalıştırılan tüm adımlarda Success, Add Site to Upstream 2secikpbrg Success; HTTPS HTTP/2 200 ve geçerli TLS; giriş ekranı açıldı; altı uygulama kurulu. İlk kurulum tamamlandı (veritabanında setup_complete=1); Desk ve uygulama ana ekranları açıldı (live-site-desk, live-site-education, live-site-lms).

1. Genel Dashboard → Sites → New Site (/dashboard/sites/new) formunu kullanma: bu kurulumda Framework seçenekleri görünmedi.
2. Bench Active olduktan sonra Dashboard → Benches → egitimxv1 (bench-0027) → Sites → New Site yolunu aç. Bu kurulumda adres /dashboard/groups/bench-0027/sites/new.
3. Grup private kalır; site bu grubun kendi sayfasından açıldığı için grubu public yapmaya gerek yoktur. Grup görünürlüğünü değiştirme.
4. Uygulamalar: frappe otomatik gelir; erpnext, crm, education, lms ve payments seçilir. education için ERPNext, lms için Payments gerekir.
5. Site adı egitimxv1; panelin base domain’i ile tam adres egitimxv1.metaframer.net. Version 16 seçili olmalı.
6. Plan: Metaframer ERP Test ($0/ay); plan açıklaması ürün garantisi içermediğini belirtir. Bölge: Hetzner Falkenstein (FSN1).
7. Bölgeye bağlı yasal onay kutusunu yalnız kullanıcı metni okuyup açıkça kabul ettikten sonra işaretle. İsteğe bağlı yerel iş ortağı bilgisi kutusu bu kurulumda kapalı bırakıldı.
8. Create site ile bir kez gönder. Oluşturma işinin sonucunu, HTTPS yanıtını, giriş ekranını ve kurulu app listesini ayrı ayrı kontrol et; sonuç görülmeden formu tekrar gönderme.

Somut notlar:

- Bu kurulumda form gönderildi; form önce Creating site... This may take a while... gösterdi (bu anın ekran görüntüsü yayımlanmadı).
- Tarihsel gözlem: Benches → bench-0027-000002-apphtznr → Sites tablosunda egitimxv1.metaframer.net satırı Installing idi (live-bench-active görseli); o anda New Site adımı Success, Install Apps Running, upstream 2secikpbrg Pending. Installing site başarısı değildir.
- Güncel sonuç: site Active ve Apps sekmesinde altı uygulama (live-site-active-apps). New Site Agent Job 2sdhhleqvr (uzak iş 4435) çalıştırılan tüm adımlarda Success; Add Site to Upstream 2secikpbrg Success. TLS doğrulaması atlanmadan yapılan HTTPS curl isteği HTTP/2 200 ve geçerli sertifika döndü; tarayıcıda giriş ekranı açıldı (live-site-https-login).
- Kurulum sürerken formu tekrar gönderme, job’u yeniden başlatma veya siteyi silme. Site Active olduktan sonra HTTPS, giriş ve uygulama listesini ayrı ayrı doğrula; bu kurulumda üçü de ayrı kanıtla doğrulandı.
- İlk kurulum: Press Setup Site düğmesiyle otomatik giriş yapıldı ve kurulum sihirbazı tamamlandı; sitenin veritabanından okunan setup_complete değeri 1. Kişisel hesap alanlarını ve parolayı kullanıcı kendisi girdi; bu değerler kaydedilmedi. Test seçimleri: dil Türkçe, ülke Türkiye, saat dilimi Europe/Istanbul, para birimi TRY; şirket EgitimXV1, kısaltma EXV1, Turkey varsayılan hesap planı, mali yıl başlangıcı 2026-01-01; ERP kurulumundaki demo veri kutusu kapalı. CRM kendi örnek/onboarding lead kayıtlarını otomatik gösteriyor; hiçbir kayıt silinmedi. Gerçek iş akışları, para işlemleri ve entegrasyonlar test edilmedi.
- Default cluster kaydının title ve country alanları boştu (null); bu yüzden yasal metinde bölge adı yerine null görünüyordu. App sunucusunun availability zone değeri fsn1-dc8 olarak doğrulandı. Önceki iki değer yedeklendikten sonra yalnız katalog alanları güncellendi: title Hetzner Falkenstein (FSN1), country Germany. Yasal metin artık doğru bölgeyi gösteriyor.
- Bu düzeltme yalnız katalog etiketidir: sunucu, sağlayıcı veya ağ ayarı değiştirilmedi, servis yeniden başlatılmadı. Tüm altyapının konum denetimi yapılmış sayılmaz.
- DNS gerekirse Hüseyin Cengiz kayıt türü/adı/değerini hazırlar, Asistan Hüseyin GoDaddy’de uygular, Hüseyin Cengiz HTTPS sonucunu doğrular.
- Administrator parolası veya başka secret değerleri rehberde yayımlanmaz; mevcut giriş bilgileri değiştirilmez. Mevcut siteler ve bench-0022 uygulamaları korunuyor.

Doğrulama: Site Active; 2sdhhleqvr ve 2secikpbrg Success; HTTPS HTTP/2 200, geçerli TLS; giriş ekranı açıldı; bench list-apps altı uygulamayı döndürdü. İlk kurulum tamamlandı (setup_complete=1); Desk, Eğitim, LMS, CRM ve ERPNext ekranları açıldı. İş akışları test edilmedi.

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
- Bu gözlem anında site oluşturulmadı. Doğru yol sonradan bulundu: Benches → egitimxv1 (bench-0027) → Sites → New Site (/dashboard/groups/bench-0027/sites/new); site adımına bak.
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
- Bu beş satırlık çekim CRM eklenmeden önceki tarihsel görüntüdür. Güncel tabloda altıncı satır crm → SRC-crm-002; live-cleanup-crm adımına bak.
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
- Bu çekim ilk candidate deploy-0027-000001’in beş satırını gösterir ve tarihsel kanıt olarak kalır. CRM içeren güncel candidate live-candidate-two adımındadır.
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
- Preparing anının ekranı yayımlanmadı; bu, canlı oturumda kaydedilen geçmiş gözlemdir. kpktsdsd9n sonucu Failure; live-current-failure adımına bak.

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
- Awaiting Deploy o andaki gözlenen durumdur. Sonradan qoh3rkif10 Success ve deploy sonrasında yeni bench Active oldu (live-bench-active); egitimxv1.metaframer.net sitesi oluşturuldu ve Active (live-site-active-apps).
- Ekran görüntüsü yayımlanmadı; bu, canlı oturumda kaydedilen geçmiş gözlemdir.

Doğrulama: egitimxv1 satırı Active değil; site oluşturma için hazır Bench yok.

Bu adım için henüz ekran kanıtı yok.

## 33. Dashboard New Bench sürüm seçenekleri boş

New Bench ekranında framework version seçenekleri görünmedi. Desk üzerinden doğru grup oluşturma yoluna geçildi.

1. Dashboard → Benches → New Bench akışını aç ve framework version seçim alanını kontrol et.
2. Bu oturumda seçenekler boş görüldü. Seçim varmış gibi ilerleme; Desk aramasından Release Group List açarak doğru egitimxv1 grubunu oluşturma yolunu kullan.
3. Desk’teki bench-0027 ve güncel candidate deploy-0027-000002 kaydıyla ilerle (ilk candidate deploy-0027-000001 / kpktsdsd9n Failure ile bitti); Dashboard seçeneklerini build/deploy sonucu sonrasında yeniden kontrol et.

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

- Show Agent Version repo HEAD bilgisidir. SSH incelemesinde sunucudaki repo HEAD aynı bulundu; ancak agent/web.py yerelde değiştirilmiş ve legacy_builder.py dosyası mevcut. Bu nedenle HEAD tek başına çalışan kodu tanımlamaz.
- Aynı sunucudaki 7 Ekim 07:27 başarılı filename build’i ve doğrulanan disk doluluğu nedeniyle protokol uyuşmazlığı bu upload hatasının çözümü olarak sunulmaz; agent kodunu değiştirme.
- Ekran görüntüsü yayımlanmadı; bu, canlı oturumda kaydedilen geçmiş gözlemdir.

Doğrulama: Commit kimliği kaydedildi; SSH ile HEAD aynı, çalışma ağacında agent/web.py değişikliği ve legacy_builder.py görüldü.

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
- Bu, ilk candidate deploy-0027-000001’in build’idir ve tarihsel kanıt olarak kalır. Disk temizliğinden sonraki deploy-0027-000002’nin ilk build’i f476t39m7i farklı bir nedenle (Pre-build npm aralığı ayrıştırma) başarısız oldu; sonraki build j8vu7j2qnm Upload Build Context dahil 27 adımı geçti ama son adım Upload Docker Image’da Failure ile bitti; yeni build qoh3rkif10 28/28 Success ile bitti (live-build-success).
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

Error Log qu5n7pv6pk: POST builder/upload/kpktsdsd9n yanıtı HTTP 500; yanıt JSON olarak çözümlenemedi. Neden sunucuda doğrulandı: Nginx, istek gövdesini geçici dosyaya yazarken disk doluluğu hatası verdi.

1. Build → Error Log → Deploy Candidate Build Exception kaydını aç; response ve path satırlarını oku.
2. Uygulama sunucusunda /var/log/nginx/error.log içinde aynı build kimliğini ve /agent/builder/upload yolunu ara; UTC zaman damgalarını Türkiye saatine (+3) çevirerek Error Log zamanıyla eşleştir.

Somut notlar:

- Nginx error.log: kpktsdsd9n POST /agent/builder/upload isteğinde 08:52:59, 08:58:00 ve 09:03:02 UTC (Türkiye saatiyle 11:52:59, 11:58:00, 12:03:02) pwrite() temporary request body failed (28: No space left on device). Üç kayıt, Press’in üç upload denemesiyle uyumludur.
- Kök dosya sistemi df -h ile 150 GB boyut, 144 GB kullanılmış, 156 MB boş, %100 dolu ölçüldü; df -i ile inode kullanımı %63. Sorun inode tükenmesi değil, blok alanı doluluğudur.
- Bu kanıt 6 Ekim Redis job kaydından ayrı, bugünkü upload isteğine ait doğrudan kanıttır. Redis’in güncel persistence durumu ok.
- BufferedReader hatası traceback değişkenlerinin yazdırılmasında oluşuyor; birincil HTTP 500 hatasıyla karıştırma.
- Ekran görüntüsü yayımlanmadı; Error Log ve sunucu logları yalnız gerekli satırlar metin olarak aktarılarak kaydedildi.

Doğrulama: HTTP 500 nedeni Nginx geçici istek gövdesi dosyası için disk alanı yetersizliği olarak doğrulandı. Sonradan onaylı build cache temizliğiyle disk %48’e indi. deploy-0027-000002’nin ilk build’i f476t39m7i Pre-build’de durdu. Hedefli düzeltme sonrası j8vu7j2qnm’de Upload Build Context Success; temizlik sonrası upload engeli geçildi (live-prebuild-upload-success). Aynı build sonradan farklı bir nedenle, Upload Docker Image adımında Failure ile bitti (live-ecr-push-failure). Sonraki qoh3rkif10 Success ve image ECR’de doğrulandı (live-build-success); yeni bench Active (live-bench-active). Site Active; HTTPS HTTP/2 200 ve geçerli TLS (live-site-https-login).

Bu adım için henüz ekran kanıtı yok.

## 40. Eski build Pre-build aşamasında durmuş

Eski rgv1 grubunda Pre-build Failure gözlendi. İlk egitimxv1 build’i kpktsdsd9n bu aşamayı geçip Upload’da durdu; iki hatayı karıştırma.

1. Eski ve güncel build kayıtlarında ilk Failure satırının Stage/Step değerlerini yan yana karşılaştır.

Somut notlar:

- Ekran görüntüsü yayımlanmadı; bu, canlı oturumda kaydedilen geçmiş gözlemdir.

Doğrulama: Eski hata Pre-build (Required app not found); kpktsdsd9n hatası Upload / Build Context. j8vu7j2qnm build’inde Pre-build ve Upload Build Context Success; onun hatası son adım Upload Docker Image.

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

Doğrulama: Her iki durumda seçenek görünmedi; site oluşturulmadı. Site formu sonradan grubun kendi sayfasından açıldı: /dashboard/groups/bench-0027/sites/new.

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

Preparing veya Failure durumunda uygulama listesine dönmeden önce build aşamasını ve ilgili logu belirle. Bu kurulumda dört farklı hata ayrı kanıtlarla bulundu: Required app not found, Upload HTTP 500, npm aralığı ayrıştırma ve registry’de eksik image deposu (Upload Docker Image).

1. Release Group → Deploy Candidate → Deploy Candidate Build kaydını aç. Grup, candidate, build kimliğini ve zaman damgasını kaydet; egitimxv1 için bench-0027 / deploy-0027-000001 / kpktsdsd9n.
2. Build Steps tablosunda ilk Failure satırını bul. Sonraki Pending satırlar çoğunlukla henüz başlamamış adımlardır; ayrı hata sanma.
3. Run Validations → Pre-build Failure ise satırı açıp Output alanını oku. Required app not found çıktısında istenen bağımlılığı gerçek App/Source ve uyumlu branch ile ekle. Eski educator denemesinde eksik app erpnext idi. Output Invalid simple block ise sorun uygulama listesi değil sürüm aralığı ayrıştırmasıdır; live-npm-range-validation adımına bak.
4. Upload → Build Context Failure ise build Connections → Error Log bağlantısını aç. Deploy Candidate Build Exception kaydında request method, path ve response koduna bak. Güncel kanıt qu5n7pv6pk: POST builder/upload/kpktsdsd9n → HTTP 500.
5. Upload → Docker Image Failure ise satır Output’unun son satırını oku; Agent Job Success sonucunu image push başarısı sayma. Registry’de depo yoksa live-ecr-push-failure adımına bak.
6. Traceback sonunda JSONDecodeError varsa daha önceki response satırını oku. HTTP 500 birincil hata; JSONDecodeError yanıtın JSON olarak çözümlenemediğini belirtir. BufferedReader cannot pickle ise traceback değişkenini yazdırırken oluşmuş ikincil hatadır.
7. Server List → ilgili Build Server → Ping → Ping Agent ile bağlantıyı kontrol et. pong, temel bağlantıyı doğrular; upload veya build protokolünün doğru olduğunu kanıtlamaz.
8. Aynı Server → Actions → Show Agent Version ile agent commit’ini; Help → About ile yönetim paneli Frappe/Press sürümünü kaydet. Hedef grubun v16 uygulama sürümlerini yönetim panelinin v15 Framework sürümüyle karıştırma.
9. Agent Job → Run Remote Builder kayıtlarını tarih ve Reference Name ile eşleştir. 5ignfoq0t5 kaydında 6 Ekim tarihli Redis AOF / No space left on device hatası var; bu tarihsel kanıttır, bugünkü upload 500 için sunucuda ayrıca ölçüm yapılır.
10. Doğru uygulama sunucusuna bağlandığını doğrula (hostname ve rol); bağlantı bilgilerini, IP’yi ve kimlik bilgilerini rehbere veya bilete yazma. Bu kurulumda ilk denenen IP başka bir altyapı sunucusuydu.
11. df -h ile blok alanını oku: kök dosya sistemi Use% ve Avail değerlerine bak. Bu kurulumda 150 GB, 144 GB kullanılmış, 156 MB boş, %100.
12. df -i ile inode kullanımını ayrı oku. No space left on device hem blok alanı hem inode tükenmesinde görülebilir; bu kurulumda inode %63, yani neden blok alanı doluluğu.
13. İlgili Nginx error.log satırlarını yalnız build kimliği ve /agent/builder/upload yolu ile filtreleyerek oku. Bu kurulumda kpktsdsd9n için 08:52:59, 08:58:00, 09:03:02 UTC (11:52:59, 11:58:00, 12:03:02 TSİ) pwrite() temporary request body failed (28: No space left on device) görüldü.
14. docker system df ile yalnız özet kullanımı oku; ayrıntılı (-v) listeyi veya image adlarını rehbere taşıma. Bu kurulumda temizlik öncesi Build Cache 61.2 GB, Images 29 GB geri kazanılabilir; üç aktif container çalışıyor.
15. redis-cli INFO persistence ile aof_last_write_status, rdb_last_bgsave_status ve aof_last_bgrewrite_status değerlerini oku. Bu kurulumda üçü de ok; 6 Ekim Redis hatası bugün sürmüyor.
16. Ölçümler salt okunurdur. Temizlik yalnız kullanıcının açık silme onayıyla ve yalnız kullanılmayan Docker build cache için yapılır; image, site, veritabanı, container, backup veya Redis dosyası silme. Servis yeniden başlatma veya deploy bu adımın parçası değildir.
17. Repo HEAD bilgisi çalışan kodu tek başına kanıtlamaz. Bu sunucuda HEAD aynı, ancak agent/web.py değiştirilmiş ve legacy_builder.py mevcut; disk doluluğu doğrulandığı için protokol uyuşmazlığını çözüm olarak uygulama ve agent kodunu değiştirme.
18. Preparing sırasında Error Log veya Agent Job filtreleri boş olabilir. Bu kurulumda üç upload denemesi ve aradaki toplam 600 saniye bekleme Preparing süresini açıkladı. Kayıt oluşmadan tekrar build başlatma.
19. Agent Job, RQ Job ve Error Log filtrelerinin kapsamını kontrol et. No matching records yalnız seçili filtrede kayıt olmadığını söyler; sistemde hiçbir iş veya hata yok demek değildir. Scheduler Active de build endpoint sağlığını kanıtlamaz.
20. Onaylı build cache temizliği sonrasında df -h ile boş alanı yeniden ölç; ardından tek build ile clone → validation → package → upload → image build/push Success akışını doğrula. Sonra deploy/Bench ve en son egitimxv1 sitesinin HTTPS, giriş ve app ekranlarını doğrula.

Somut notlar:

- Bu kurulumda Upload HTTP 500’ün kök nedeni doğrulandı: uygulama sunucusunda kök dosya sistemi %100 dolu ve Nginx upload isteğinin gövdesini geçici dosyaya yazamadı. 6 Ekim Redis kanıtından ayrı, bugünkü doğrudan kanıttır.
- Agent Job listesinde başka başarılı builder işleri var. 333inegvf4 bugün 07:27’de filename protokolüyle Success; protokol uyuşmazlığı bu hatanın nedeni veya çözümü olarak kabul edilmez.
- Press Settings → Branch global bir ayardır. Use for Build kutusu endpoint oluşturmaz. Update Agent veya Ansible düğmesine rastgele basma; servis etkisi ve geri dönüş planı incelenmeli.
- Sadece upload endpoint’ini içeren eski bir commit seçmek yeterli değildir: build endpoint’inin filename/Dockerfile sözleşmesi de uyumlu olmalı. Bu yüzden doğrulanmamış SHA’yı branch alanına yazmak çözüm değildir.
- Secret içerebilen tam traceback, agent tokenları, config veya özel anahtarlar public rehbere aktarılmaz. Buradaki ekranlar görünür veri incelemesinden geçirildi.
- Teknik düzeltme sahibi Hüseyin Cengiz. DNS gerekirse kayıt gereksinimini Hüseyin Cengiz hazırlar, GoDaddy uygulamasını Asistan Hüseyin yapar.
- Doğru uygulama sunucusuna SSH bağlantısı başarılı oldu. Kullanıcı onayıyla yalnız docker builder prune --all --force çalıştırıldı (exit 0); image, site, veritabanı, container veya app kaldırılmadı, deploy yapılmadı.
- Temizlik sonrası df -h: 150 GB, 69 GB kullanılmış, 76 GB boş, %48 (önce 156 MB boş, %100). Üç container aynı uptime ile çalışıyor; Redis bgsave/write ok. Ayrıntı live-cleanup-crm adımında.
- Ayrı hata: Press Dashboard Daily Usage analytics InternalServerError. Hedefli düzeltme kuruldu ve canlıda doğrulandı; Daily Usage artık No data gösteriyor. Log server yapılandırılmadığı için metrik yokluğu çözülmemiş bir yetenek eksikliğidir. Boş analytics grafiği site kesintisi veya sıfır kullanım anlamına gelmez; site durumunu Dashboard status, HTTPS yanıtı ve giriş ekranıyla ayrıca doğrula. Ayrıntı live-analytics-daily-usage adımında.

Doğrulama: İlk başarısız aşama, HTTP 500 kaydı ve bunun nedeni olan disk doluluğu (df -h, df -i, Nginx error.log) ayrı kanıtlarla kaydedildi. Onaylı build cache temizliği başarılı. deploy-0027-000002’nin ilk build’i f476t39m7i Pre-build’de npm aralığı ayrıştırma hatasıyla durdu; hedefli düzeltme sonrası j8vu7j2qnm 27 adımı Success geçti, son adım Upload Docker Image’da registry deposu eksik olduğu için Failure ile bitti. Yalnız eksik ECR deposu oluşturuldu; yeni build qoh3rkif10 28/28 Success, image ECR’de tam tag ile doğrulandı. Deploy başlatıldı; yeni bench önce Installing, sonra Active (New Bench Agent Job tgajt4obnu Success). Site Active; HTTPS HTTP/2 200, geçerli TLS ve giriş ekranı doğrulandı. Bu zincir build hatalarını kapsar; tüm Press hatalarının çözüldüğü anlamına gelmez (Daily Usage analytics notuna bak).

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

Tarihsel kanıt: 6 Ekim tarihli 5ignfoq0t5 job traceback’i Redis AOF dosyasına yazımda No space left on device hatasını gösteriyor. Bugünkü upload hatasının kanıtı ayrıdır.

1. 5ignfoq0t5 job kaydında Traceback alanının son satırını oku.
2. Redis’in güncel durumunu redis-cli INFO persistence ile salt okunur kontrol et; bu kurulumda aof_last_write_status, rdb_last_bgsave_status ve aof_last_bgrewrite_status ok.
3. Bugünkü upload hatası için Nginx error.log ve df -h kanıtını kullan; live-agent-http500 ve hata-tanisi adımlarına bak.

Somut notlar:

- Bu hata 6 Ekim 18:47–18:59 işine ait tarihsel kayıttır. Bugünkü HTTP 500 bu kayda dayanılarak değil, aynı güne ait Nginx log ve df ölçümüyle doğrulandı.
- Bu kayıt incelenirken temizlik yapılmadı. Sonradan kullanıcı onayıyla yalnız Docker build cache temizlendi; backup, Redis AOF, image veya site silinmedi. Aktif siteler korunuyor.
- Çekim Request Data ve token alanlarını dışarıda bırakacak şekilde kırpıldı.

Doğrulama: 6 Ekim: redis.exceptions.ResponseError: MISCONF Errors writing to the AOF file: No space left on device. 7 Ekim güncel Redis persistence durumu ok.

Açıklamalı ekran: [temiz ekran ve çerçeveler](https://karacaismail.github.io/pressguide/steps/live-redis-enospc/)

## 55. Build cache temizliği ve CRM eklenmesi

Kullanıcı onayıyla yalnız Docker build cache temizlendi; disk %100’den %48’e indi. Ardından egitimxv1 / bench-0027 Apps tablosuna crm eklendi ve altı satır kaydedildi.

1. Silme işleminden önce kullanıcıdan yalnız Docker build cache için açık onay al. Onaydan sonra docker builder prune --all --force çalıştır ve exit kodunu kontrol et; bu kurulumda exit 0, çıktıdaki Total 96.68 GB.
2. df -h ile kök dosya sistemini yeniden ölç. Bu kurulumda 150 GB, 69 GB kullanılmış, 76 GB boş, %48 (önce 156 MB boş, %100).
3. Mevcut container’ların yeniden başlamadığını uptime ile, Redis yazımının sürdüğünü redis-cli INFO persistence ile kontrol et. Bu kurulumda üç container aynı uptime ile çalışıyor; bgsave/write ok.
4. bench-0027 → Apps → Add Row: App crm, Source SRC-crm-002 (branch main, Version 16, Enabled). Save ile kaydet ve altı satırı tekrar oku.

Somut notlar:

- Yalnız build cache temizlendi. Image, site, veritabanı, container veya app kaldırılmadı; deploy yapılmadı.
- Değişiklik yalnız egitimxv1 / bench-0027 grubunda yapıldı. Mevcut 10 site, custom app’ler ve Press’in Frappe 15 yönetim kurulumu korunuyor.
- O anda svholl uygulamasının kimliği belirsiz olduğu için gruba eklenmedi. Kullanıcı sonradan bunun school yazımı olduğunu açıkladı; okul yönetimi ihtiyacı gruptaki mevcut education uygulamasıyla karşılanır. Bu bir çıkarımdır; ayrı okul reposu belirlenmedi ve ayrı uygulama eklenmedi.
- Bağımlılık sırası korunuyor: LMS için Payments, Education için ERPNext kendilerinden önce yer alır. crm son satırdadır.
- Kaydedilmiş tablo yapılandırma kanıtıdır; build başarısı değildir. SSH bağlantı bilgisi, kimlik bilgisi ve kullanıcı/site verisi rehbere aktarılmaz.

Doğrulama: Prune exit 0; df -h %48; üç container ve Redis yazımı çalışıyor. Apps tablosunda altı satır kaydedildi: frappe, erpnext, payments, education, lms, crm. Bu adım anında build sonucu yoktu; sonraki build’ler için live-candidate-two ve live-npm-range-validation adımlarına bak.

Açıklamalı ekran: [temiz ekran ve çerçeveler](https://karacaismail.github.io/pressguide/steps/live-cleanup-crm/)

## 56. İkinci candidate: deploy-0027-000002

CRM eklendikten sonra yeni candidate oluşturuldu; altı uygulama belirli commitlere sabitlendi. İlk build f476t39m7i Pre-build validation’da Failure; hedefli düzeltme sonrası j8vu7j2qnm 27 adımı geçip son adım Upload Docker Image’da Failure ile bitti; eksik ECR deposu oluşturulduktan sonra yeni build qoh3rkif10 28/28 Success; ardından Deploy başlatıldı.

1. bench-0027 → Actions → Create Deploy Candidate ile yeni candidate oluştur; bu kurulumda deploy-0027-000002.
2. Apps & Deps içinde altı satırın Source, Release ve Hash alanlarını kontrol et. crm satırı SRC-crm-002, commit deedce73c1eb48577e7f70e95df6bac1dc55c93f.
3. crm commit manifestini runtime ile karşılaştır: Frappe >=15,<17 ve Python >=3.10; grup Version 16 ve Python 3.14.
4. Build → Complete ile yalnız build başlat. Build Success olmadan Deploy menüsünü kullanma.

Somut notlar:

- Ekranda hash sütunu kısaltılmış görünür; tam commit kimliği App Release kaydından okunur.
- Görsel yalnız Apps & Deps tablosunu gösterir; build başlangıcı veya sonucu bu görselde yoktur.
- Eski candidate deploy-0027-000001 ve onun kpktsdsd9n Failure build’i tarihsel kanıt olarak kalır; silinmedi.
- Bu candidate’ın ilk build’i f476t39m7i Pre-build validation’da Failure ile bitti ve tarihsel kanıt olarak kalır; ayrıntı live-npm-range-validation adımında. Aynı candidate için sonraki build j8vu7j2qnm de son adım Upload Docker Image’da Failure ile bitti (live-ecr-push-failure); ardından qoh3rkif10 başlatıldı ve 28/28 Success ile bitti (live-build-success).
- Deploy başlatıldı; yeni bench önce Installing, sonra Active oldu (live-bench-active). Site oluşturuldu ve Active; altı uygulama sitede kurulu (live-site-active-apps).

Doğrulama: Candidate bench-0027’ye bağlı; altı satırda Source, Release ve Hash dolu. İlk build f476t39m7i Failure; j8vu7j2qnm Failure (son adım Upload Docker Image); qoh3rkif10 Success (28/28). Yeni bench Active; site Active, HTTPS doğrulandı.

Açıklamalı ekran: [temiz ekran ve çerçeveler](https://karacaismail.github.io/pressguide/steps/live-candidate-two/)

## 57. Pre-build validation: npm sürüm aralığı ayrıştırma hatası

deploy-0027-000002’nin ilk build’i f476t39m7i Pre-build validation aşamasında Failure ile bitti. Neden uygulama listesi değil, Press’in Node npm aralığını yanlış ayrıştırıcıyla okumasıydı. Bu adımın yayımlanmış ekranı yok.

1. f476t39m7i build kaydını aç; Build Steps içindeki ilk Failure satırının Pre-build validation olduğunu doğrula.
2. Satırı açıp Output alanını oku. Bu kurulumdaki çıktı: Invalid simple block '^20.19.0 || >=22.12.0'. Bu, Required app not found hatasından farklıdır; uygulama veya Source eklemek çözüm değildir.
3. Nedeni ayır: ^ ve || npm sürüm aralığı sözdizimidir. semantic-version kütüphanesinde SimpleSpec bu sözdizimini kabul etmez; npm aralıkları NpmSpec ile okunur. Press Node gereksinimini SimpleSpec ile ayrıştırdığı için doğrulama hata verdi.
4. Düzeltme hedefli olmalı: yalnız Node gereksinimi kontrolü NpmSpec kullanır; Python gereksinimi SimpleSpec ile kalır. Kurulu sürümlerin NpmSpec desteğini doğrula; bu kurulumda semantic-version 2.10.0 ve Python 3.10.12 destekliyor.
5. Uygulamadan önce özgün dosyanın yedeğini al ve SHA değerini kontrol et; düzeltmeyi incelet. Regresyon testlerini gerçek kurulumdan önce ve sonra çalıştır; bu kurulumda altı test her iki seferde geçti.
6. Değişikliği yüklemek için yalnız boşta olan build worker’larını yeniden başlat. Bu kurulumda dört boşta build worker yeniden başlatıldı; web ve Redis süreçlerine dokunulmadı.
7. Aynı candidate için tek yeni build başlat ve sonucunu izle. Bu kurulumda j8vu7j2qnm 13:39:11 TSİ’de başladı ve Pre-build validation Success oldu (live-prebuild-upload-success); build daha sonra farklı bir nedenle, son adım Upload Docker Image’da Failure ile bitti (live-ecr-push-failure). Sonuç görülmeden yeni build açma.

Somut notlar:

- Doğrulamayı atlama: Pre-build validation’ı kapatma, Node gereksinimini silme ve uygulamanın sürüm aralığını değiştirme. Hata ayrıştırıcıdaydı; çözüm aralığın doğru ayrıştırıcıyla okunmasıdır.
- f476t39m7i Failure kaydı tarihsel kanıt olarak kalır; silinmedi. kpktsdsd9n Upload hatası (disk doluluğu) ile bu Pre-build hatası ayrı nedenlerdir.
- Kapsam yalnız egitimxv1 / bench-0027; diğer 10 site ve gruplarına dokunulmadı, hiçbir uygulama kaldırılmadı. svholl (sonradan school olarak açıklandı) için ayrı uygulama eklenmedi; okul yönetimi mevcut education uygulamasıyla karşılanır (çıkarım).
- Ekran görüntüsü yayımlanmadı; bu adım canlı oturumda okunan çıktının metin kaydıdır. Sunucu bağlantı bilgisi, IP ve kimlik bilgileri rehbere aktarılmaz.

Doğrulama: f476t39m7i: Pre-build validation Failure, Invalid simple block '^20.19.0 || >=22.12.0'. Hedefli düzeltme sonrası altı regresyon testi geçti. j8vu7j2qnm’de Pre-build validation Success; bu build sonradan Upload Docker Image’da Failure ile bitti. Sonraki qoh3rkif10 Success ve yeni bench Active; egitimxv1 sitesi Active ve HTTPS doğrulandı.

Bu adım için henüz ekran kanıtı yok.

## 58. j8vu7j2qnm: Pre-build, Package ve Upload geçti (tarihsel ekran)

Tarihsel çekim: j8vu7j2qnm Running iken altı clone, Pre-build validation, Package Build Context ve Upload Build Context (satır 7–9) Success görüldü. Özgün Upload HTTP 500 ve Node npm aralığı engelleri geçildi. Build daha sonra son adım Upload Docker Image’da Failure ile bitti; live-ecr-push-failure adımına bak.

1. deploy-0027-000002 → Deploy Candidate Build → j8vu7j2qnm kaydını aç; güncel durum FINISHED / Failure. Bu ekran Running anına aittir.
2. Build Steps tablosunda 7. Run Validations / Pre-build, 8. Package / Build Context ve 9. Upload / Build Context satırlarının Success olduğunu kontrol et.
3. Running veya Pending satırlar hata değildir; ilk Failure görüldüğünde yalnız o satırın Output alanını ve Error Log bağlantısını aç. Bu build’de ilk ve tek Failure son adım Upload Docker Image.
4. Build Success olmadan Deploy menüsünü kullanma; sonuç görülmeden yeni build başlatma.

Somut notlar:

- Görselde ilk dokuz adım Success, 10. satır Setup Prerequisites / Install Essential Packages Running, sonraki satırlar Pending. Bu, çekim anının tarihsel görüntüsüdür; güncel durum değildir.
- Sonraki okumada 27 adımın tamamı Success (altı uygulama kuruldu); 28. ve son adım Upload Docker Image Failure ile bitti.
- Pre-build Success, f476t39m7i’deki Invalid simple block hatasının hedefli NpmSpec düzeltmesiyle geçildiğini gösterir. Upload Build Context Success, kpktsdsd9n’deki disk doluluğu kaynaklı HTTP 500’ün temizlik sonrası tekrar etmediğini gösterir.
- kpktsdsd9n, f476t39m7i ve j8vu7j2qnm Failure kayıtları tarihsel kanıt olarak kalır; silinmedi.
- Bu ekran build başarısı değildir. Sonraki başarılı build qoh3rkif10 live-build-success adımındadır.

Doğrulama: Çekim anında satır 1–9 Success (altı clone, Pre-build, Package, Upload Build Context). j8vu7j2qnm sonradan FINISHED / Failure: 27 adım Success, son adım Upload Docker Image Failure; bu build’in image’ı push edilmedi.

Açıklamalı ekran: [temiz ekran ve çerçeveler](https://karacaismail.github.io/pressguide/steps/live-prebuild-upload-success/)

## 59. Upload Docker Image Failure: registry deposu eksik

j8vu7j2qnm build’i 27 adımı Success geçtikten sonra son adım Upload Docker Image’da Failure ile bitti: image’ın gönderileceği ECR deposu yoktu. Bu adımın yayımlanmış ekranı yok.

1. Build kaydında son Failure satırını (Upload / Docker Image) aç ve Output alanının son satırını oku. Bu kurulumda: repository 'frappe/metaframer.net/bench-0027' does not exist in registry.
2. Agent Job sonucunu image push sonucuyla karıştırma. Bu kurulumda ji7trk4c6d Success ve data.build_failed=false; bu yalnız uzak işin döndüğünü gösterir. Push sonucu Build Steps satırındadır.
3. Önce hedefi doğrula: Press sunucusundaki mevcut AWS kimlik bilgisinin hesabı yapılandırılmış registry hesabıyla eşleşmeli; region ve namespace (frappe/<domain>/bench-XXXX) registry adresiyle aynı olmalı. Secret değerlerini yazdırma.
4. Tam hedef adla describe_repository çalıştır. RepositoryNotFoundException dönerse yalnız bu hedef depoyu oluştur; şifreleme, tarama ve tag mutability ayarlarını mevcut bir bench deposuyla (bu kurulumda bench-0022) aynı tut ve oluşturma sonrası tekrar describe ile doğrula.
5. Mevcut depoları değiştirme veya silme; AWS hesap ayarlarına dokunma.
6. Aynı candidate için normal cache ile tek yeni build başlat. Bu kurulumda qoh3rkif10 13:51:58 TSİ’de başladı (o anda Preparing) ve sonradan 28/28 Success ile bitti (live-build-success). Sonuç görülmeden yeni build açma.

Somut notlar:

- Push adımını atlama, Upload Docker Image’ı devre dışı bırakma ve Failure build’i elle Success olarak işaretleme; deploy, image’ın registry’de bulunmasına bağlıdır.
- Bu kurulumda yapılandırılmış hesap doğrulandı, yalnız bench-0027 deposu oluşturulup doğrulandı; mevcut depolar ve AWS hesap ayarları değiştirilmedi.
- j8vu7j2qnm Failure kaydı tarihsel kanıt olarak kalır; silinmedi.
- Ekran görüntüsü yayımlanmadı; bu adım canlı oturumda okunan çıktının metin kaydıdır. AWS hesap kimliği, erişim anahtarları ve registry kimlik bilgileri rehbere aktarılmaz.

Doğrulama: j8vu7j2qnm FINISHED / Failure: 27 adım Success, son adım Upload Docker Image Failure. bench-0027 deposu oluşturuldu ve doğrulandı. Sonraki qoh3rkif10 Success ve image push ECR’de doğrulandı; ayrıntı live-build-success.

Bu adım için henüz ekran kanıtı yok.

## 60. qoh3rkif10: build Success ve image ECR’de

deploy-0027-000002 için qoh3rkif10 build’i 28/28 adım Success ile bitti; image ECR’de tam tag ile doğrulandı. Deploy bu başarılı build’den bir kez başlatıldı. Build başarısı, Bench veya site hazır olduğu anlamına gelmez.

1. deploy-0027-000002 → Deploy Candidate Build → qoh3rkif10 kaydını aç; başlıktaki durum etiketini ve Status alanını oku. Bu kurulumda ikisi de Success.
2. Build Steps tablosunda tüm satırları kontrol et; bu kurulumda 28/28 adım Success, son adım Upload Docker Image dahil.
3. Image’ı registry’de ayrıca doğrula: ECR describe_images’ı tam depo adı ve tam tag ile çalıştır; digest ve boyutu kaydet. Bu kurulumda digest sha256:31977a473a878d2de8e966f10954bbf699d804d5ae4d8128eb3061cce9ef9abf, imageSizeInBytes 1723501363. Mevcut aynı AWS hesap kimliğini kullan; kimlik bilgisini yazdırma.
4. Ancak bundan sonra aynı build sayfasında Deploy → Deploy seçeneğini bir kez kullan. Bu kurulumda Deploy deploy-0027-000002 oluştu, kuyruk kaydı sutd4rm1um Started, yeni bench bench-0027-000002-apphtznr o anda Installing.
5. Deploy’u tekrar başlatma; Bench Active olana kadar bekle ve logları izle. Bu kurulumda bench sonradan Active oldu; live-bench-active adımına bak. Site oluşturma ancak Active Bench doğrulandıktan sonra yapılır.

Somut notlar:

- Görsel yalnız build kaydını gösterir: başlık Success, Status Success ve Build Steps’in ilk altı clone satırı. 28/28 sonucu, ECR doğrulaması ve deploy/bench durumu ekranın dışındaki ayrı canlı okumalardır.
- Bu okuma anında bench Installing idi; Installing hazır Bench değildir. Sonraki Active bench live-bench-active adımında; Active site, HTTPS ve giriş ekranı live-site-active-apps ve live-site-https-login adımlarında ayrı kanıtlarla doğrulandı.
- j8vu7j2qnm, f476t39m7i ve kpktsdsd9n Failure kayıtları tarihsel kanıt olarak kalır; silinmedi. Yeni uygulama, kaynak veya kök kimlik bilgisi eklenmedi.
- AWS hesap kimliği, erişim anahtarları ve registry kimlik bilgileri rehbere aktarılmaz.

Doğrulama: Ekranda: qoh3rkif10 başlık ve Status alanı Success. Ayrı okumalar: 28/28 adım Success; ECR describe_images tam tag ile digest ve 1723501363 bayt döndü; Deploy deploy-0027-000002 Started, bench-0027-000002-apphtznr o anda Installing (sonradan Active; live-bench-active). Site ve HTTPS bu ekranın kanıtı değildir; sonradan ayrı doğrulandı (live-site-https-login).

Açıklamalı ekran: [temiz ekran ve çerçeveler](https://karacaismail.github.io/pressguide/steps/live-build-success/)

## 61. Yeni bench Active: bench-0027-000002-apphtznr

qoh3rkif10 build’inden yapılan deploy sonrası yeni bench Installing durumundan Active durumuna geçti; New Bench Agent Job tgajt4obnu Success. Görsel Dashboard bench sayfasıdır: bench Active, egitimxv1.metaframer.net site satırı Installing. Active Bench site oluşturmanın ön koşuludur, site başarısı değildir.

1. Dashboard → Benches → egitimxv1 (bench-0027) → bench-0027-000002-apphtznr sayfasını aç; başlıktaki durum etiketini oku. Bu kurulumda Active.
2. Bench’in Release Group = bench-0027, Deploy Candidate = deploy-0027-000002 ve Build = qoh3rkif10 ile eşleştiğini kontrol et; altı uygulama listesi grup ve candidate kayıtlarından okunur (live-cleanup-crm, live-candidate-two).
3. New Bench Agent Job sonucunu ayrıca oku; bu kurulumda tgajt4obnu Success.
4. Site formunu grubun kendi sayfasından aç (site adımı). Gönderimden sonra aynı bench sayfasının Sites sekmesinde site satırının Status değerini izle; bu kurulumda Installing.

Somut notlar:

- Üç durum ayrı okunur. Build durumu (qoh3rkif10 Success) image’ın üretilip registry’ye gönderildiğini gösterir. Bench durumu (Active) bu image’dan bench’in sunucuda hazırlandığını gösterir. Site durumu (Installing) site kaydının bu bench üzerinde oluştuğunu ve uygulama kurulumunun sürdüğünü gösterir. Biri diğerinin başarısı değildir.
- Görsel yalnız bench başlığındaki Active etiketini ve Sites tablosundaki egitimxv1.metaframer.net satırının Installing durumunu gösterir. Uygulama listesi bu görselde yoktur; altı uygulamanın kanıtı önceki grup ve candidate ekranlarıdır.
- Bu görsel TARİHSEL kanıttır: çekim anında New Site Agent Job 2sdhhleqvr (uzak iş 4435) içinde New Site adımı Success, Install Apps adımı Running; upstream iş 2secikpbrg Pending idi. Sonradan site Active oldu; bu sonuç ayrı kanıttır (live-site-active-apps, live-site-https-login).
- Mevcut siteler ve bench-0022 uygulamaları korunuyor; hiçbir uygulama veya veri silinmedi. Önceki Failure build’leri tarihsel kanıt olarak kalır.

Doğrulama: Ekranda (çekim anı): bench başlık etiketi Active; egitimxv1.metaframer.net satırı Installing. Ayrı okumalar: New Bench Agent Job tgajt4obnu Success; o anda 2sdhhleqvr New Site Success, Install Apps Running. Sonraki Active site, HTTPS ve giriş ayrı adımlarda doğrulandı.

Açıklamalı ekran: [temiz ekran ve çerçeveler](https://karacaismail.github.io/pressguide/steps/live-bench-active/)

## 62. Site Active: altı uygulama kurulu

Site Installing durumundan Active durumuna geçti. Dashboard site sayfasının Apps sekmesinde altı uygulama görünür: frappe, erpnext, payments, Education, lms, crm. Active site, ilk kurulumun bittiği anlamına gelmez.

1. Dashboard → Sites → egitimxv1.metaframer.net sayfasını aç; başlıktaki durum etiketini oku. Bu kurulumda Active.
2. Apps sekmesinde App ve Branch sütunlarını oku; altı uygulamanın grup ve candidate kayıtlarıyla (live-cleanup-crm, live-candidate-two) eşleştiğini kontrol et.
3. Agent Job sonuçlarını ayrıca oku: New Site Agent Job 2sdhhleqvr (uzak iş 4435) çalıştırılan tüm adımlarda Success; Add Site to Upstream 2secikpbrg Success.
4. Kurulu sürümleri uzak sunucuda bench list-apps ile salt okunur oku; ekrandaki commit mesajındaki sürüm metnini sürüm kanıtı sayma.

Somut notlar:

- Görsel yalnız başlıktaki Active etiketini ve Apps tablosundaki altı uygulama adı ile branch değerlerini gösterir: frappe, erpnext, payments ve Education version-16; lms ve crm main.
- Ayrı okuma (görselde değil): uzak bench list-apps sonucu frappe 16.50.0, erpnext 16.50.0, payments 0.0.1, education 16.0.1, lms 2.64.0, crm 1.86.0.
- Bench sayfasındaki Installing çekimi (live-bench-active) tarihsel kanıt olarak kalır; bu Active site ekranı ayrı ve sonraki kanıttır. Önceki Failure build’leri de tarihsel kanıttır.
- Uygulamaların kurulu olması ERP, eğitim, LMS veya CRM iş akışlarının test edildiği anlamına gelmez; bu kurulumda iş akışı testi yapılmadı.
- Dashboard Daily Usage grafiği No data gösterir: bu kurulumda log server yapılandırılmadı. Önceki InternalServerError hedefli düzeltmeyle giderildi (live-analytics-daily-usage). Boş analytics verisi site kesintisi veya sıfır kullanım anlamına gelmez.
- Mevcut siteler ve bench-0022 uygulamaları korunuyor; hiçbir uygulama veya veri silinmedi.

Doğrulama: Ekranda: site başlığı Active; Apps tablosunda altı uygulama ve branch değerleri. Ayrı okumalar: 2sdhhleqvr ve 2secikpbrg Success; bench list-apps altı uygulama sürümünü döndürdü. İş akışları test edilmedi.

Açıklamalı ekran: [temiz ekran ve çerçeveler](https://karacaismail.github.io/pressguide/steps/live-site-active-apps/)

## 63. HTTPS ve giriş ekranı

TLS doğrulaması atlanmadan yapılan HTTPS isteği HTTP/2 200 döndü ve sertifika geçerli; tarayıcıda Sign In ekranı açıldı. Ardından Press Setup Site ile ilk kurulum sihirbazına geçildi ve kurulum tamamlandı (setup_complete=1).

1. HTTPS yanıtını sertifika doğrulamasını kapatmadan kontrol et (örneğin curl için insecure seçeneği kullanma). Bu kurulumda yanıt HTTP/2 200 ve TLS doğrulaması geçerli.
2. Siteyi tarayıcıda aç ve giriş ekranının yüklendiğini kontrol et.
3. İlk kurulum için Dashboard site sayfasında Setup Site düğmesini kullan; bu kurulumda otomatik giriş başarılı oldu ve oturum açılmış Desk kurulum sihirbazı açıldı.
4. Kişisel hesap alanlarını ve parolayı site sahibi kendisi girer; bu değerleri rehbere, bilete veya ekran görüntüsüne aktarma.
5. Bölge ve şirket alanlarını doldur. Bu kurulumda: dil Türkçe, ülke Türkiye, saat dilimi Europe/Istanbul, para birimi TRY; şirket EgitimXV1, kısaltma EXV1, Turkey varsayılan hesap planı, mali yıl başlangıcı 2026-01-01; ERP kurulumundaki demo veri kutusu kapalı.
6. Kurulum işlenirken sayfayı yeniden gönderme. Bitince Desk ekranının açıldığını ve setup_complete değerini ayrıca doğrula; bu kurulumda veritabanı okuması 1 döndü.

Somut notlar:

- Görsel yalnız giriş ekranının yüklendiğini gösterir; e-posta alanında yalnız örnek yer tutucu vardır, gerçek hesap verisi yoktur. HTTP/2 200 ve TLS geçerliliği görselde değil, ayrı curl okumasıdır.
- Kişisel hesap alanlarını ve parolayı kullanıcı kendisi girip Continue ile ilerledi; hiçbir secret kaydedilmedi veya yayımlanmadı.
- Kurulum sihirbazı tamamlandı; son Desk ekranı live-site-desk adımında. Demo veri kutusunun kapalı olması her uygulamada örnek kayıt olmadığı anlamına gelmez: CRM örnek/onboarding lead kayıtlarını otomatik gösteriyor. İş akışları test edilmedi.
- Giriş ekranının açılması ve HTTP 200, uygulama modüllerinin çalıştığını tek başına kanıtlamaz.

Doğrulama: Ayrı okuma: HTTPS curl (TLS doğrulaması açık) HTTP/2 200, sertifika geçerli. Ekranda: Sign In formu yüklendi. Setup Site otomatik girişi kurulum sihirbazını açtı; kurulum tamamlandı, veritabanında setup_complete=1.

Açıklamalı ekran: [temiz ekran ve çerçeveler](https://karacaismail.github.io/pressguide/steps/live-site-https-login/)

## 64. İlk kurulum tamamlandı: Desk ana ekranı

Kurulum sihirbazı tamamlandı; veritabanından okunan setup_complete değeri 1. /desk ana ekranında beş uygulama kutusu görünür: ERPNext, Eğitim, Learning, Müşteri Yönetimi, Çerçeve.

1. Kurulum sihirbazı bittikten sonra https://egitimxv1.metaframer.net/desk adresini aç.
2. Uygulama kutularını oku. Bu kurulumda beş kutu: ERPNext, Eğitim (Education), Learning (LMS), Müşteri Yönetimi (CRM; ekranda kısaltılmış görünür) ve Çerçeve (Frappe).
3. İlk kurulumun bittiğini yalnız ekrana bakarak kabul etme; setup_complete değerini site veritabanından salt okunur oku. Bu kurulumda 1.
4. Her kutunun açıldığını ayrıca kontrol et: Eğitim → /desk/education, Learning → /lms/, Müşteri Yönetimi → /crm/, ERPNext → /desk/setup/home. Bu kurulumda dördü de açıldı.

Somut notlar:

- Görsel yalnız Desk ana ekranını ve beş uygulama kutusunu gösterir. setup_complete=1 ve diğer ekranların açılması ayrı okumalardır.
- Payments uygulaması kurulu (bench list-apps), ancak Desk’te ayrı kutu olarak görünmez.
- Test seçimleri: Türkçe, Türkiye, Europe/Istanbul, TRY; şirket EgitimXV1 / EXV1; Turkey varsayılan hesap planı; mali yıl başlangıcı 2026-01-01; ERP kurulumundaki demo veri kutusu kapalı. Kişisel hesap ve parola kullanıcı tarafından girildi, yayımlanmaz.
- Demo veri kutusunun kapalı olması her uygulamada örnek kayıt olmadığı anlamına gelmez: CRM örnek/onboarding lead kayıtlarını otomatik gösteriyor. Hiçbir kayıt silinmedi. CRM ekranının görüntüsü kişi verisi içerebileceği için yayımlanmadı.
- Ekranların açılması iş akışlarının çalıştığını kanıtlamaz; gerçek iş akışları, para işlemleri ve entegrasyonlar test edilmedi.
- Mevcut siteler ve bench-0022 uygulamaları korunuyor.

Doğrulama: Ekranda: /desk ana ekranında beş uygulama kutusu. Ayrı okumalar: veritabanında setup_complete=1; /desk/education, /lms/, /crm/ ve /desk/setup/home açıldı. İş akışları test edilmedi.

Açıklamalı ekran: [temiz ekran ve çerçeveler](https://karacaismail.github.io/pressguide/steps/live-site-desk/)

## 65. Eğitim çalışma alanı: /desk/education

Desk’te Eğitim kutusu /desk/education çalışma alanını açar. Kısayollar ve Raporlar & Kayıtlar bölümleri görünür.

1. Desk ana ekranında Eğitim kutusuna tıkla veya /desk/education adresini aç.
2. Başlığın Eğitim olduğunu ve Kısayollar bölümünün yüklendiğini kontrol et: Öğrenci, Eğitmen, Program, Kurs, Satış Faturası, Student Monthly Attendance, Course Scheduling, Student Attendance.
3. Raporlar & Kayıtlar altındaki grupları (Student Management, Academics, Admissions, Fee Management, Attendance vb.) yalnız gezinme için oku; bu adımda kayıt oluşturma.

Somut notlar:

- Görsel çalışma alanının o anki arayüzünü gösterir; kısayollardaki sayaçlar (örneğin 0 Active) çekim anındaki okumadır, iş akışı sonucu değildir.
- Okul yönetimi ihtiyacı education uygulamasıyla karşılanır (çıkarım); öğrenci, program, kayıt, ücret veya devamsızlık iş akışları test edilmedi.
- Ekranda kişisel veri yoktur; hiçbir kayıt oluşturulmadı veya silinmedi.

Doğrulama: Ekranda: /desk/education çalışma alanı, Eğitim başlığı ve sekiz kısayol. İş akışları test edilmedi.

Açıklamalı ekran: [temiz ekran ve çerçeveler](https://karacaismail.github.io/pressguide/steps/live-site-education/)

## 66. LMS ana sayfası: /lms/

Desk’te Learning kutusu /lms/ ana sayfasını açar. Kenar çubuğunda Kurs menüsü ve sağda Getting started paneli görünür.

1. Desk ana ekranında Learning kutusuna tıkla veya /lms/ adresini aç.
2. Kenar çubuğunda Kurs, Programs, Sınıflar gibi menülerin ve sağdaki Getting started panelinin yüklendiğini kontrol et.
3. Getting started adımlarını bu doğrulamanın parçası olarak çalıştırma; kurs, ders veya sınıf oluşturma ayrı bir iş akışıdır.

Somut notlar:

- Görsel LMS ana sayfasının o anki arayüzünü gösterir. Ana sayfada bir kurs kartı ve 0/8 adımlık Getting started paneli görünür; bu, rehberin oluşturduğu içerik veya tamamlanmış bir iş akışı olarak sunulmaz. Hiçbir kayıt silinmedi.
- Kurs oluşturma, öğrenci kaydı, sınav veya ödeme akışları test edilmedi.

Doğrulama: Ekranda: /lms/ ana sayfası, kenar çubuğunda Kurs menüsü ve Getting started paneli. İş akışları test edilmedi.

Açıklamalı ekran: [temiz ekran ve çerçeveler](https://karacaismail.github.io/pressguide/steps/live-site-lms/)

## 67. Dashboard Daily Usage: InternalServerError düzeltildi, log server yok

Log server yapılandırılmamışken Press Dashboard Daily Usage grafiği InternalServerError veriyordu. Hedefli düzeltme sonrası grafik No data gösteriyor. Metrik yokluğu çözülmemiş bir yetenek eksikliğidir, sıfır kullanım değildir. Bu adımın yayımlanmış ekranı yok.

1. Press Desk → Error Log listesini aç; traceback içinde daily_usage ve get_usage geçen kayıtları ara. Bu kurulumda son satır str nesnesinde max çağrısından gelen AttributeError idi.
2. Press Settings → log_server alanını kontrol et. Bu kurulumda log server yapılandırılmamış.
3. Nedeni ayır: log server yokken veya aggregations boş dönerken get_usage boş sözlük döndürüyordu. Bu değeri liste bekleyen üç tüketici sözlüğün anahtarları (str) üzerinde dolaşıyor ve max çağrısı hata veriyordu.
4. Düzeltme hedefli olmalı: yalnız bu iki boş dönüş [] yapılır. Hata yakalama, maskeleme veya sahte sıfır veri ekleme yapılmaz.
5. Kurmadan önce özgün dosyanın yedeğini al ve SHA değerini kontrol et; düzeltmeyi incelet. Kodu yüklemek için yalnız Press web sürecini yeniden başlat; müşteri bench’lerine dokunma.
6. Sonucu canlıda doğrula: daily_usage yanıtı boş data listesi ve plan limiti döndürmeli; Dashboard Daily Usage grafiği InternalServerError yerine No data göstermeli.

Somut notlar:

- Bu kurulumda: düzeltme öncesi testler RED (2 fail / 1 pass), düzeltme sonrası GREEN (3/3). Bağımsız inceleme, sınırlı kaynak erişimiyle, uygulanabilir bulgu bildirmedi. Yedek ve SHA doğrulandı.
- Yalnız Press web süreci yeniden başlatıldı; müşteri bench’leri ve mevcut siteler etkilenmedi.
- Canlı okuma: daily_usage yanıtında data [] ve plan limiti 86400; Dashboard Daily Usage No data gösteriyor, InternalServerError görünmüyor.
- Log server yapılandırılmadı. No data, sitenin kullanılmadığı veya kesinti olduğu anlamına gelmez; kullanım metrikleri log server kurulana kadar yoktur. Bu açık bir yetenek eksikliğidir.
- Bu düzeltme yalnız bu analytics hatasını kapsar; tüm Press altyapı hatalarının çözüldüğü iddia edilmez.
- Ekran görüntüsü yayımlanmadı; traceback ve sunucu bilgileri yalnız gerekli satırlar metin olarak aktarılarak kaydedildi.

Doğrulama: Düzeltme öncesi Error Log’da daily_usage/get_usage traceback’i; düzeltme sonrası daily_usage data [], plan limiti 86400; Dashboard Daily Usage No data, InternalServerError yok. Log server yapılandırılmadı; metrikler yok.

Bu adım için henüz ekran kanıtı yok.

## Kaynaklar

- [Frappe Education: okul yönetim sistemi](https://github.com/frappe/education)
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
