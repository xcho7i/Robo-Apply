import React from 'react'
import Layout from '../../layout'
import FaqHeader from './ui/FaqHeader'
import Faqs from '../../components/faq'
const FaqBlogPage = () => {
  return (
    <>
    <Layout
    
    >
        <FaqHeader/>
        <Faqs header={false}/>
        </Layout>
    </>
  )
}

export default FaqBlogPage