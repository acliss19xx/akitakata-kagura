import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
}

const SEO = ({
  title,
  description = "広島県安芸高田市の神楽イベント情報を集約。公演スケジュール、出演神楽団、会場情報などを掲載しています。",
  image = "/favicon.png", // デフォルト画像（必要に応じてOGP用の大きな画像に変更してください）
  url = window.location.href,
  type = "website",
}: SEOProps) => {
  const siteTitle = "安芸高田 神楽イベント情報";
  const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;

  return (
    <Helmet>
      {/* Standard metadata tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={new URL(image, window.location.origin).href} />
      <meta property="og:url" content={url} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={new URL(image, window.location.origin).href} />
    </Helmet>
  );
};

export default SEO;
