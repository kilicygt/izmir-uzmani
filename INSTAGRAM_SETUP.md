# Instagram Entegrasyonu Kurulum Rehberi

Web sitenizdeki "Instagram'da Bizi Takip Edin" bölümünde **kendi hesabınızın** en son gönderilerini göstermek istiyorsanız, bir **Instagram Erişim Jetonu (Access Token)** almanız gerekmektedir. 

Bu işlem, verilerinizin güvenliği ve Instagram'ın politikaları gereği zorunludur.

## Adım 1: Instagram Basic Display Uygulaması Oluşturma

1.  [Meta for Developers](https://developers.facebook.com/) adresine gidin ve Facebook hesabınızla giriş yapın.
2.  Sağ üstteki **My Apps (Uygulamalarım)** butonuna tıklayın ve **Create App (Uygulama Oluştur)** deyin.
3.  Uygulama türü olarak **Consumer (Tüketici)** veya **Other (Diğer)** seçeneğini seçin.
4.  Uygulamanıza bir isim verin (örn: "IzmirUzmaniWebsite") ve oluşturun.
5.  Uygulama panelinde, **Products (Ürünler)** menüsünden **Instagram Basic Display**'i bulun ve **Set Up (Kur)** butonuna tıklayın.

## Adım 2: Kullanıcı Ekleyin

1.  Sol menüden **Roles (Roller)** -> **Roles** kısmına gidin.
2.  **Instagram Testers (Instagram Test Kullanıcıları)** bölümüne gelin ve **Add Instagram Testers (Instagram Test Kullanıcısı Ekle)** butonuna tıklayın.
3.  Kendi Instagram kullanıcı adınızı yazın ve ekleyin.
4.  Şimdi Instagram hesabınıza (web veya mobil) gidin, **Ayarlar > Uygulamalar ve Web Siteleri > Test Kullanıcısı Davetleri** bölümünden bu daveti kabul edin.

## Adım 3: Token Alın

1.  Developers portalına geri dönün.
2.  **Instagram Basic Display** -> **Basic Display** menüsüne gidin.
3.  Aşağıda **User Token Generator** bölümünü göreceksiniz.
4.  Kendi hesabınızın yanındaki **Generate Token** butonuna tıklayın.
5.  Açılan pencerede Instagram'a giriş yapın ve izin verin.
6.  Size uzun, karmaşık bir kod (**Access Token**) verilecek. Bu kodu kopyalayın.

## Adım 4: Sitemize Ekleyin

Kopyaladığınız bu kodu bana iletin veya kod içerisindeki ilgili alana (daha sonra oluşturacağımız `instagram.ts` dosyasına) ekleyelim.

> **Not:** Bu tokenler güvenlik amacıyla belirli sürelerde (genellikle 60 gün) geçerliliğini yitirebilir. Token süresi dolduğunda yenilemeniz gerekecektir.

Alternatif olarak, kodla uğraşmak istemezseniz **Elfsight**, **SnapWidget** gibi hazır servisleri kullanarak size verecekleri tek satırlık kodu siteye yapıştırabiliriz. Bu yöntem çok daha kolaydır ve token yenileme derdi yoktur.
