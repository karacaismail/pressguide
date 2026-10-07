# Press kullanım rehberi

Güncelleme: 7 Ekim 2026 · Europe/Istanbul

egitimxv1 Release Group oluşturuldu (bench-0027). Beş app ve bağımlılık kontrolü kaydedildi; deploy-0027-000001 candidate oluşturuldu. kpktsdsd9n build Preparing: sonuç henüz doğrulanmadı. Site henüz oluşturulmadı.

## 1. Release Group ve Team seçimi

Bir Release Group, birlikte build ve deploy edilecek uygulama kaynaklarını tanımlar. Site oluşturma adımı değildir.

1. Press aramasına Release Group List yaz. Add Release Group ile formu aç.
2. Title için egitimxv1 kullan; mevcut kaydı düzeltirken yeni kayıtla karıştırma.
3. Version alanında Version 16; Team alanında ilgili kaynakların sahibi olan takımı seç.

Somut notlar:

- Görselde Administrator görünen bir Team kaydı var. Team alanı oturum açan kullanıcı rolünü seçmez.
- Her zaman Administrator seçmek genel bir kural değildir; bu kurulumda mevcut kaynakların sahibi aynı takım ise seçilir.
- Sonraki canlı adımlarda egitimxv1 / bench-0027 oluşturuldu.

Doğrulama: Kaydetmeden önce Team ve uygulama kaynaklarının sahipliği uyumlu olmalı.

Açıklamalı ekran: [görsel ve oklar](https://karacaismail.github.io/pressguide/steps/team/)

## 2. Hazır uygulama sunucusunu seç

Servers tablosu kayıtlı ve hazır app sunucularını gruba bağlar.

1. Servers → Add Row.
2. Mevcut app sunucusunu seç. Aynı sunucuyu ikinci satıra tekrar ekleme.

Somut notlar:

- İkinci sunucu eklemek için önce Press içinde ayrı ve hazır bir Server kaydı gerekir; Add Row tek başına Hetzner sunucusu kurmaz.
- Hüseyin Cengiz ikinci sunucunun kapasitesini, agent erişimini, rollerini ve güvenli ağ bağlantısını hazırlar; Asistan Hüseyin gerekirse GoDaddy DNS kaydını uygular; Hüseyin Cengiz doğrular.
- Mevcut çalışan servisleri yeniden başlatmak bu adımın parçası değildir.

Doğrulama: Canlı oturumda egitimxv1 / bench-0027 grubunda mevcut app sunucusunun seçildiği görüldü. Bu seçim, sunucunun sağlık durumunun veya agent erişiminin bağımsız doğrulaması değildir; build ve deploy sonucu ayrıca kontrol edilmeli.

Açıklamalı ekran: [görsel ve oklar](https://karacaismail.github.io/pressguide/steps/server/)

## 3. Uygulamaları bağımlılık sırasıyla ekle

Framework ilk sırada olmalı; her satırın App ve Source alanları birlikte tamamlanmalı.

1. Apps sekmesini aç. İlk satıra frappe ekle.
2. Education için erpnext satırını education satırından önce ekle.
3. Ardından education; LMS kullanılacaksa kendi branch bağımlılıklarını doğrulayarak payments ve lms ekle.
4. Check Dependent Apps kontrolünü aç; elle kaynak ve sürüm incelemesini de tamamla.

Somut notlar:

- Görseldeki xyz örnek bir bilinmeyen app; gerçek bir uygulama adı değildir.
- Tüm uygulamaları aynı anda eklemek yerine uyumlu küçük bir küme ile başlayıp build sonucu doğrula.
- Education ve LMS aynı işlevi temsil etmez; kurulacak uygulamalar teknik bağımlılıklarıyla seçilir.

Doğrulama: Her App kendi gerçek paket adıyla ve doğru App Source ile eşleşmeli.

Açıklamalı ekran: [görsel ve oklar](https://karacaismail.github.io/pressguide/steps/apps/)

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

Açıklamalı ekran: [görsel ve oklar](https://karacaismail.github.io/pressguide/steps/new-app/)

## 5. App Source: repo ve branch bağlantısı

App Source aynı App için kullanılacak Git reposunu, branch ve sürüm uyumluluğunu tanımlar.

1. Apps satırında Source alanını aç.
2. Doğru App adına bağlı hazır source varsa onu seç.
3. Kaynak yoksa Create a new App Source ile repo ve branch tanımla.

Somut notlar:

- Rastgele Source seçme: frappe kaynağını education satırına bağlama.
- Bir App birden fazla branch/source içerebilir; kaynak kimliği uygulama kimliğiyle aynı şey değildir.

Doğrulama: Her satırda App, Source, repository ve branch eşleşmesini kontrol et.

Açıklamalı ekran: [görsel ve oklar](https://karacaismail.github.io/pressguide/steps/source/)

## 6. Görseldeki educator kaydı neden şüpheli?

Bu kayıt education reposunu farklı bir teknik app adıyla temsil ediyor.

1. Bu örneği kopyalayarak ilerleme.
2. education/version-16/education/hooks.py dosyasını aç.
3. app_name = education ve required_apps = erpnext değerlerini doğrula.
4. Grup içinde gerçek education App kaydı ve ona bağlı source kullan.

Somut notlar:

- Press develop kaynağı dependency hooks yolunu App adıyla kuruyor; educator yanlış dosya yoluna dönüşebilir.
- Kurulu Press sürümü henüz doğrulanmadığı için bu tespit canlı log ile karşılaştırılmalı.

Doğrulama: Yanlış App adı, eksik ERPNext ve build log birlikte incelenmeli.

Açıklamalı ekran: [görsel ve oklar](https://karacaismail.github.io/pressguide/steps/identity-error/)

## 7. Branch gerçekten repoda bulunmalı

Version 16 seçimi GitHub branch adını otomatik doğrulamaz.

1. Repo sayfasında branch listesini aç.
2. education için version-16 branch varlığını doğrula.
3. frappe ve gerekiyorsa erpnext için de version-16 kullan; her uygulama kendi destek sözleşmesiyle kontrol edilir.

Somut notlar:

- LMS dahil her app için version-16 yazmak doğru bir genel kural değildir. Branch mevcut olmalı ve Frappe 16 desteği doğrulanmalı.
- Hareketli version-16 branch tek başına uyum garantisi değildir: candidate release commit manifestleri Python/Frappe sürümleriyle karşılaştırılmalı.

Doğrulama: Kaynak branch GitHub üzerinde bulunmalı; bağımlılıklar o branch dosyalarından okunmalı.

Açıklamalı ekran: [görsel ve oklar](https://karacaismail.github.io/pressguide/steps/branch/)

## 8. App Source formunu doğru doldur

Repo URL, App kimliği, branch ve Versions uyumlu olmalı.

1. App = education; Repository URL = https://github.com/frappe/education.
2. Branch = version-16; Enabled açık.
3. Versions satırına Version 16 ekle; Team grubun takımına uygun olmalı.
4. Save ile kaydet. Frappe işareti yalnız frappe framework kaynağında açık olmalı.

Somut notlar:

- Görselde App = educator olduğu için bu görüntü doğru tamamlanmış örnek değildir; düzeltilmesi gereken örnektir.
- Public alanı GitHub reposunun görünürlüğüyle aynı karar değildir; Press içi paylaşım anlamını kontrol etmeden değiştirme.

Doğrulama: Doğru teknik ad ve source uyumluluğu doğrulanmadan release/build başlatma.

Açıklamalı ekran: [görsel ve oklar](https://karacaismail.github.io/pressguide/steps/source-form/)

## 9. Create Release neyi oluşturur?

App Release, kaynak branch üzerindeki bir Git commit referansını kaydeder.

1. App Source kaydı kaydedildikten sonra Actions menüsünü aç.
2. Create Release ile commit kaydını üret.
3. App Release bağlantısından branch ve commit bilgisini kontrol et.

Somut notlar:

- Release oluşması uygulamanın yüklendiği, build olduğu veya çalıştığı anlamına gelmez.
- Bu eski ekran educator hatasını içeriyor; doğru source için aynı akış uygulanır.

Doğrulama: App Release doğru App Source ve commit referansına bağlı olmalı.

Açıklamalı ekran: [görsel ve oklar](https://karacaismail.github.io/pressguide/steps/release/)

## 10. Release Group içinde doğru source seçimi

App kaynaklarının seçilmesi build içeriğini belirler.

1. frappe satırına v16 framework source bağla.
2. ERPNext bağımlılığını ekle, ardından education kaynağını bağla.
3. Save ile grubu kaydet.

Somut notlar:

- Görselde educator seçilmiş: bunu education için doğru örnek sayma.
- SRC isimlerini bu kurulumdan kopyalamak yerine kendi kayıtlarının repo/branch alanlarını incele.

Doğrulama: Apps tablosunda boş Source veya yanlış App kimliği bulunmamalı.

Açıklamalı ekran: [görsel ve oklar](https://karacaismail.github.io/pressguide/steps/source-selection/)

## 11. Create Deploy Candidate

Deploy Candidate, grup uygulama release’lerinin build için seçilmiş anlık kümesidir.

1. Kaydedilmiş doğru grupta Actions → Create Deploy Candidate.
2. Yeni candidate bağlantısını aç; Apps & Deps listesini incele.

Somut notlar:

- Ekrandaki rgv1 / bench-0026 eski örnektir; egitimxv1 önerilen yeni adla karıştırma.
- Create Duplicate Deploy Candidate ve Change Server farklı işlemlerdir.

Doğrulama: Candidate içinde framework ve tüm gerekli uygulamalar doğru sırada olmalı.

Açıklamalı ekran: [görsel ve oklar](https://karacaismail.github.io/pressguide/steps/candidate/)

## 12. Build ve deploy başlatma

Candidate hazırlandıktan sonra build ve deploy kuyruğa alınır.

1. Deploy Candidate sayfasında Deploy menüsünü aç.
2. Schedule Build and Deploy işlemini yalnız hedef grubu ve sunucuyu doğruladıktan sonra kullan.
3. Deploy Candidate Build bağlantısından ayrıntıyı izle.

Somut notlar:

- Mevcut çalışan siteleri barındıran bir grupta deploy, migration ve yeniden başlatma etkisi taşıyabilir. Eğitim için izole grubun kapsamı kontrol edilmeli.

Doğrulama: Yeni build kaydı oluşmalı; durum ve loglar izlenmeli.

Açıklamalı ekran: [görsel ve oklar](https://karacaismail.github.io/pressguide/steps/schedule/)

## 13. Preparing: çalışıyor mu?

Son eski ekran yalnız Preparing durumunu gösteriyor; başarılı build, deploy veya site kanıtı yok.

1. Build satırını aç, zaman damgası ve aşama loglarını oku.
2. Error Log bağlantısını ve candidate Apps & Deps listesini incele.
3. Preparing uzun sürüyorsa Press worker/scheduler ve build server görevlerini Hüseyin Cengiz’e kanıtlarıyla aktar.
4. Başarılı build sonrasında Deploy ve Bench kaydını ayrıca doğrula.

Somut notlar:

- Sadece bu ekranla kurulum çalışıyor deneme. Hata türü belirlenmeden tekrar tekrar yeni build açma.
- 7 Ekim 2026 11:20 görseli tarihsel kanıt; canlı durum değildir.
- Sonraki canlı kontrolde iki build Failure bulundu; live-error adımına bak.

Doğrulama: Build başarılı, deploy başarılı ve ilgili Bench hazır olmadan Site adımına geçme.

Açıklamalı ekran: [görsel ve oklar](https://karacaismail.github.io/pressguide/steps/preparing/)

## 14. Eğitim sitesini oluştur ve doğrula

Site adı egitimxv1 olacak. Yeni eğitim grubu bench-0027; build/deploy sonucu bekleniyor.

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

Doğrulama: Mevcut altyapı kaydı okundu.

Açıklamalı ekran: [görsel ve oklar](https://karacaismail.github.io/pressguide/steps/live-press/)

## 16. Canlı hata: ERPNext eksik

rgv1 / bench-0026 Apps tablosunda yalnız frappe ve educator bulunuyor.

1. Kaynak uygulamasının gerçek adını kontrol et.
2. ERPNext bağımlılığını eklemeden yeni build başlatma.

Somut notlar:

- Mevcut grubu silmeden yeni egitimxv1 için doğru kaynaklar kullanılacak.

Doğrulama: Canlı tabloda ERPNext bulunmuyor.

Açıklamalı ekran: [görsel ve oklar](https://karacaismail.github.io/pressguide/steps/live-apps/)

## 17. Canlı build sonucu: iki Failure

Preparing ekranının ardından her iki build de başarısız olmuş.

1. Son build satırını aç.
2. Build Steps → Pre-build ayrıntısını incele.

Somut notlar:

- İlk build 1alh023bg7; ikinci build 2ae1i6en1o.

Doğrulama: İki build durumunun Failure olduğu canlı okundu.

Açıklamalı ekran: [görsel ve oklar](https://karacaismail.github.io/pressguide/steps/live-failure/)

## 18. Canlı hata çıktısı: Required app not found

Pre-build çıktısı eksik uygulamayı doğrudan ERPNext olarak belirtiyor.

1. Pre-build satırına tıkla.
2. Output alanındaki uygulama ve bağımlılık adlarını oku.

Somut notlar:

- Canlı çıktı: ('Required app not found', 'educator', 'erpnext').
- Klonlama başarılı; hata pre-build bağımlılık doğrulamasında.

Doğrulama: Eksik ERPNext canlı log ile doğrulandı.

Açıklamalı ekran: [görsel ve oklar](https://karacaismail.github.io/pressguide/steps/live-error/)

## 19. Dashboard New Site ekranı

Sites → New Site açıldı; framework version seçenekleri görünmedi.

1. Dedicated server seçeneğini kontrol et.
2. Desk ve hazır Bench verileriyle neden seçenek olmadığına bak.

Somut notlar:

- Ödeme yöntemi ekleme uyarısı ayrı konu; bu görevde ödeme yöntemi eklenmedi.
- Henüz site oluşturulmadı.

Doğrulama: Versiyon seçeneklerinin boş olduğu canlı gözlendi.

Açıklamalı ekran: [görsel ve oklar](https://karacaismail.github.io/pressguide/steps/live-new-site/)

## 20. egitimxv1 grubu kaydedildi

Grup kimliği bench-0027; Team Administrator, Version 16, mevcut app sunucusu.

1. Release Group List içinde egitimxv1 kaydını aç; kayıt kimliğinin bench-0027 olduğunu kontrol et.
2. Title = egitimxv1, Team = Administrator ve Version = Version 16 alanlarını kontrol et; Servers tablosunda mevcut app sunucusunu seç.
3. Save ile kaydet. Yeni kayıt oluşturmak yerine sonraki Apps ve candidate işlemlerini bu bench-0027 kaydı üzerinde sürdür.

Somut notlar:

- bench-0027 Release Group kimliğidir; bu kaydın oluşması çalışan Bench veya Site oluştuğunu kanıtlamaz.
- Administrator burada kaynakların sahibi olan Team kaydıdır. Mevcut başka grupları veya çalışan siteleri değiştirmeden eğitim grubunda ilerle.

Doğrulama: Grup kimliği bench-0027; Team Administrator, Version 16, mevcut app sunucusu.

Açıklamalı ekran: [görsel ve oklar](https://karacaismail.github.io/pressguide/steps/live-saved/)

## 21. Runtime ayarları oluştu

Python 3.14, Node 24.12.0, Bench 5.28.0 ve Pip 25.3 kaydetme sonrası oluştu.

1. bench-0027 kaydında runtime alanlarını aç; Python 3.14, Node 24.12.0, Bench 5.28.0 ve Pip 25.3 değerlerini oku.
2. Deploy Candidate içindeki App Release commitlerini aç; her uygulamanın pyproject.toml ve ilgili sürüm gereksinimlerini bu runtime ayarlarıyla karşılaştır.
3. Build logunda kullanılan gerçek runtime ve kurulum sonucunu ayrıca kontrol et; yalnız form değerlerine bakarak build başarılı deme.

Somut notlar:

- Bu değerler grup kaydedildikten sonra oluşan yapılandırma alanlarıdır; sunucuda çalışan süreçlerin sürüm ölçümü değildir.
- Branch güncellenebilir. Uyumluluk incelemesini candidate içindeki sabit commitlere göre yap; çalışan sunucu paketlerini bu formu doldurmak için değiştirme.

Doğrulama: Python 3.14, Node 24.12.0, Bench 5.28.0 ve Pip 25.3 kaydetme sonrası oluştu.

Açıklamalı ekran: [görsel ve oklar](https://karacaismail.github.io/pressguide/steps/live-runtime/)

## 22. Doğru beş uygulama ve kaynak

frappe → erpnext → payments → education → lms. Check Dependent Apps açık.

1. bench-0027 → Apps tablosuna sırasıyla frappe, erpnext, payments, education ve lms satırlarını ekle.
2. Source alanlarını eşleştir: frappe → SRC-frappe-004; erpnext → SRC-erpnext-008; payments → SRC-payments-004; education → SRC-education-003; lms → SRC-lms-002.
3. Check Dependent Apps kutusunu açık tut. Save ile tabloyu kaydet ve kaydedilmiş beş satırı tekrar oku.

Somut notlar:

- frappe framework ilk sıradadır; education için erpnext, lms için payments gerekli olduğundan bağımlılıklar kendilerine ihtiyaç duyan uygulamalardan önce yer alır.
- Eski educator kaydını education satırında kullanma. Kaydedilmiş doğru tablo, bağımlılık hatasının giderildiği yönünde yapılandırma kanıtıdır; başarılı build kanıtı değildir.

Doğrulama: frappe → erpnext → payments → education → lms. Check Dependent Apps açık.

Açıklamalı ekran: [görsel ve oklar](https://karacaismail.github.io/pressguide/steps/live-correct-apps/)

## 23. Candidate oluşturuldu bildirimi

deploy-0027-000001 oluşturuldu. Bu bildirim build veya site başarısı değildir.

1. Kaydedilmiş egitimxv1 / bench-0027 grubunda Actions → Create Deploy Candidate seç.
2. Bildirimde oluşan deploy-0027-000001 bağlantısını aç; candidate kaydının doğru gruba bağlı olduğunu kontrol et.
3. Build başlatmadan önce candidate içindeki Apps & Deps ve App Release listesini incele.

Somut notlar:

- deploy-0027-000001 yeni eğitim grubunun candidate kimliğidir; eski bench-0026 candidate’ıyla karıştırma.
- Oluşturuldu bildirimi yalnız candidate kaydını doğrular. Build, deploy ve site oluşturma ayrı işlemlerdir.

Doğrulama: deploy-0027-000001 oluşturuldu. Bu bildirim build veya site başarısı değildir.

Açıklamalı ekran: [görsel ve oklar](https://karacaismail.github.io/pressguide/steps/live-new-candidate/)

## 24. Candidate release hashleri

Kaynaklar candidate içinde belirli commit hashlerine sabitlendi; Python/Frappe manifestleri bu commitlerden kontrol edildi.

1. deploy-0027-000001 kaydını aç; Apps & Deps içindeki frappe, erpnext, payments, education ve lms satırlarını kontrol et.
2. Her satırın App Release bağlantısını aç; kaynak kaydı ve commit hashini karşılaştır. Boş veya yanlış uygulamaya bağlı release varsa build başlatma.
3. Uyumluluk kontrolünde branch’in güncel ucunu değil, bu candidate’ın release commitlerindeki pyproject.toml ve hooks.py dosyalarını esas al.

Somut notlar:

- Candidate uygulama kaynaklarının belirli commitlerini bir araya getirir. Daha sonra branch değişmesi bu ekranda seçilmiş release hashinin aynı olduğu anlamına gelmez.
- Canlı oturumda candidate kaynakları ve commit manifestleri incelendi. Bu inceleme build/deploy sonucunun yerine geçmez.

Doğrulama: Kaynaklar candidate içinde belirli commit hashlerine sabitlendi; Python/Frappe manifestleri bu commitlerden kontrol edildi.

Açıklamalı ekran: [görsel ve oklar](https://karacaismail.github.io/pressguide/steps/live-candidate-content/)

## 25. Build → Complete

Önce yalnız build başlatıldı; başarılı build görülmeden deploy yapılmadı.

1. deploy-0027-000001 sayfasında Build menüsünü aç ve Complete seçeneğini kullanarak yalnız build işlemini başlat.
2. Oluşan Deploy Candidate Build bağlantısını aç; bu oturumda yeni kayıt kpktsdsd9n olarak görüldü.
3. Build kaydında başarılı sonuç ve aşama logları görülmeden Deploy işlemini başlatma.

Somut notlar:

- Complete burada Build menüsündeki seçenek adıdır; build durumunun tamamlandığı veya başarılı olduğu anlamına gelmez.
- Bu oturumda yalnız build başlatıldı. Schedule Build and Deploy ile build ve deploy işlemlerini birlikte başlatma akışından farklıdır.

Doğrulama: Önce yalnız build başlatıldı; başarılı build görülmeden deploy yapılmadı.

Açıklamalı ekran: [görsel ve oklar](https://karacaismail.github.io/pressguide/steps/live-build-complete/)

## 26. Yeni build kaydı

kpktsdsd9n build kaydı Preparing olarak görüldü. Henüz başarı kanıtı değil.

1. Deploy Candidate Build listesinden kpktsdsd9n kaydını aç; candidate bağlantısının deploy-0027-000001 olduğunu kontrol et.
2. Status alanını, zaman damgalarını ve Build Steps aşamalarını oku. Bu oturumda görülen durum Preparing idi.
3. Preparing sürerse aynı kaydın loglarını incele; Failure oluşursa başarısız aşamayı ve Error Log bağlantısını aç. Sonuç görülmeden yeni buildleri peş peşe oluşturma.

Somut notlar:

- kpktsdsd9n build’in açılmış olması kuyruk veya hazırlık aşamasının gözlendiğini gösterir; başarılı image, deploy veya çalışan site kanıtı değildir.
- Sonraki kabul sırası: build başarılı sonucu → deploy sonucu → Bench hazır durumu → egitimxv1 site oluşturma. Bu kayıtta son üç aşama tamamlandı diye sunulmaz.

Doğrulama: kpktsdsd9n build kaydı Preparing olarak görüldü. Henüz başarı kanıtı değil.

Açıklamalı ekran: [görsel ve oklar](https://karacaismail.github.io/pressguide/steps/live-build-start/)

## 27. Framework App Source

Canlı alanlar: frappe/frappe, version-16, Frappe checkbox açık. Alttaki installation alanı yayımlanan kırpımın dışında.

1. Apps tablosunda frappe satırının SRC-frappe-004 Source bağlantısını aç.
2. App = frappe, Repository = frappe/frappe ve Branch = version-16 alanlarını kontrol et; framework kaynağında Frappe checkbox açık olmalı.
3. Kaynak kimliğini grup satırıyla karşılaştır; diğer uygulamaların satırlarına bu framework source kaydını bağlama.

Somut notlar:

- Frappe checkbox yalnız framework olan frappe kaynağında açık tutulur; eğitim uygulamalarını framework olarak işaretleme.
- Yayımlanan görsel yalnız gereken repo/branch alanlarını gösterir; installation ve erişim bilgileri dokümana taşınmaz.

Doğrulama: Canlı alanlar: frappe/frappe, version-16, Frappe checkbox açık. Alttaki installation alanı yayımlanan kırpımın dışında.

Açıklamalı ekran: [görsel ve oklar](https://karacaismail.github.io/pressguide/steps/live-framework-source/)

## 28. ERPNext App Source

Canlı DOM: frappe/erpnext reposu version-16. Education için gerekli uygulama.

1. Apps tablosunda erpnext satırının SRC-erpnext-008 Source bağlantısını aç.
2. App = erpnext, Repository = frappe/erpnext ve Branch = version-16 eşleşmesini kontrol et.
3. education satırından önce erpnext satırının gruba eklendiğini ve kaydedildiğini doğrula.

Somut notlar:

- Education’ın required_apps kaydı ERPNext gerektirir. Eski build’de Required app not found hatasının eksik uygulaması erpnext idi.
- ERPNext source seçimi bağımlılığı gruba ekler; ERPNext’in kurulup çalıştığı ayrıca başarılı build ve site app listesiyle doğrulanır.

Doğrulama: Canlı DOM: frappe/erpnext reposu version-16. Education için gerekli uygulama.

Açıklamalı ekran: [görsel ve oklar](https://karacaismail.github.io/pressguide/steps/live-erpnext-source/)

## 29. Payments App Source

Canlı alanlar: frappe/payments reposu version-16; LMS için gerekli uygulama.

1. Apps tablosunda payments satırının SRC-payments-004 Source bağlantısını aç.
2. App = payments, Repository = frappe/payments ve Branch = version-16 alanlarını kontrol et.
3. lms satırından önce payments satırını ekle; Apps tablosunu Save ile kaydet.

Somut notlar:

- Bu candidate’taki LMS uygulaması payments bağımlılığı gerektirir; ödeme yöntemi ekleme uyarısı ile bu uygulama bağımlılığı farklı konulardır.
- Bu adım Git kaynak eşleşmesidir; bir ödeme hesabı açma, kart bilgisi girme veya ödeme alma işlemi yapılmaz.

Doğrulama: Canlı alanlar: frappe/payments reposu version-16; LMS için gerekli uygulama.

Açıklamalı ekran: [görsel ve oklar](https://karacaismail.github.io/pressguide/steps/live-payments-source/)

## 30. Education App Source

Canlı DOM: education, frappe/education, version-16. educator adı kullanılmadı.

1. Apps tablosunda education satırının SRC-education-003 Source bağlantısını aç.
2. App = education, Repository = frappe/education ve Branch = version-16 alanlarını kontrol et.
3. Teknik uygulama adının education olduğunu ve ERPNext satırının önce geldiğini doğrula; eski educator kaydını bu satırda seçme.

Somut notlar:

- education repo içindeki gerçek paket adıdır. Title alanının okunabilir olması yanlış bir App teknik adını düzeltmez.
- Eski educator kaydı bu eğitim grubunda kullanılmadı; mevcut bağlantıları incelenmeden eski kayıt silinmez veya yeniden adlandırılmaz.

Doğrulama: Canlı DOM: education, frappe/education, version-16. educator adı kullanılmadı.

Açıklamalı ekran: [görsel ve oklar](https://karacaismail.github.io/pressguide/steps/live-education-source/)

## 31. LMS App Source

Canlı alanlar: frappe/lms reposu main branch. Required Apps: frappe/payments. Her app branch’i version-16 olmak zorunda değil.

1. Apps tablosunda lms satırının SRC-lms-002 Source bağlantısını aç.
2. App = lms, Repository = frappe/lms ve Branch = main alanlarını kontrol et; bu kayıtta gözlenen branch main idi.
3. Required Apps içindeki frappe ve payments değerlerini kontrol et; ikisinin de Apps tablosunda lms satırından önce bulunduğunu doğrula.

Somut notlar:

- Her uygulamaya otomatik olarak version-16 branch yazılmaz. Bu LMS kaynağının main branch uyumluluğu candidate’taki seçilmiş commit üzerinden incelenir.
- Education ve LMS ayrı uygulamalardır; bu grupta her ikisi kendi kaynak ve bağımlılıklarıyla yer alır.

Doğrulama: Canlı alanlar: frappe/lms reposu main branch. Required Apps: frappe/payments. Her app branch’i version-16 olmak zorunda değil.

Açıklamalı ekran: [görsel ve oklar](https://karacaismail.github.io/pressguide/steps/live-lms-source/)

## 32. Dashboard bench listesi

Mevcut geniş uygulama grubu Active; rgv1 ve eğitim grubu Awaiting Deploy idi. Bu ekran site oluşturma başarısı değildir.

1. Press Dashboard → Benches listesini aç; mevcut Active kaydı ile rgv1 ve egitimxv1 eğitim grubunu ayrı satırlar olarak oku.
2. egitimxv1 satırının durumunu kontrol et; bu oturumda Awaiting Deploy görüldü.
3. Site oluşturmayı denemeden önce eğitim grubunun kendi build ve deploy sonucunu doğrula; mevcut Active gruba taşınarak sorunu gizleme.

Somut notlar:

- Mevcut başka bir Bench’in Active olması yeni eğitim grubunun hazır olduğu anlamına gelmez.
- Awaiting Deploy gözlenen durumdur; egitimxv1 için hazır Bench veya oluşturulmuş site kanıtı henüz yoktur.

Doğrulama: Mevcut geniş uygulama grubu Active; rgv1 ve eğitim grubu Awaiting Deploy idi. Bu ekran site oluşturma başarısı değildir.

Açıklamalı ekran: [görsel ve oklar](https://karacaismail.github.io/pressguide/steps/live-dashboard-bench/)

## 33. Dashboard New Bench sürüm seçenekleri boş

New Bench ekranında framework version seçenekleri görünmedi. Desk üzerinden doğru grup oluşturma yoluna geçildi.

1. Dashboard → Benches → New Bench akışını aç ve framework version seçim alanını kontrol et.
2. Bu oturumda seçenekler boş görüldü. Seçim varmış gibi ilerleme; Desk aramasından Release Group List açarak doğru egitimxv1 grubunu oluşturma yolunu kullan.
3. Desk’teki bench-0027, candidate deploy-0027-000001 ve build kpktsdsd9n kayıtlarıyla ilerle; Dashboard seçeneklerini build/deploy sonucu sonrasında yeniden kontrol et.

Somut notlar:

- Boş seçenek listesinin nedeni bu ekran görüntüsünden kesinleştirilmedi. Framework source, Team paylaşımı ve hazır Bench verileri ayrı inceleme gerektirir.
- New Bench formunun açılması Bench veya Site oluşturmaz; bu oturumda bu boş formdan kayıt oluşturulmadı.

Doğrulama: New Bench ekranında framework version seçenekleri görünmedi. Desk üzerinden doğru grup oluşturma yoluna geçildi.

Açıklamalı ekran: [görsel ve oklar](https://karacaismail.github.io/pressguide/steps/live-dashboard-empty/)

## Kaynaklar

- [Education v16: app_name ve required_apps](https://github.com/frappe/education/blob/version-16/education/hooks.py)
- [Press App Source uygulaması](https://github.com/frappe/press/blob/develop/press/press/doctype/app_source/app_source.py)
- [Frappe Press resmî kaynak kodu](https://github.com/frappe/press)
- [Astro: GitHub Pages dağıtımı](https://docs.astro.build/en/guides/deploy/github/)
- [ERPNext v16 runtime gereksinimleri](https://github.com/frappe/erpnext/blob/version-16/pyproject.toml)
- [Payments v16 runtime gereksinimleri](https://github.com/frappe/payments/blob/version-16/pyproject.toml)
- [LMS v16 bağımlılıkları](https://github.com/frappe/lms/blob/version-16/lms/hooks.py)
