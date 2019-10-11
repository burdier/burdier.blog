import React from "react"
import LandingBio from "../components/landing-bio"
import Layout from "../components/layout"
import SEO from "../components/seo"
import { Helmet } from 'react-helmet';

const IndexPage = () => (
  <Layout>
  <Helmet>
  <meta name="google-site-verification" content="FdSNSP68gSU-__FXFZJ56gax-FKsCruWgNeVTQtCrWs" />
</Helmet>
    <SEO  title="Burdier Blog" keywords={[`burdier`, `blog`, `developer`]} />
    <LandingBio />
  </Layout>
)

export default IndexPage
