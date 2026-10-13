<script setup>
import logo from '@/img/favicon/favicon.svg'

const footerSections = [
  {
    title: 'About',
    links: [
      { label: 'About Us', href: '#' },
      { label: 'Our Branches', href: '#' },
      { label: 'Changelog', href: '#' },
    ],
  },
  {
    title: 'Quick Links',
    links: [
      { label: 'FAQs', href: '#' },
      { label: 'Recipes', href: '#' },
      { label: 'Contact Us', href: '#' },
    ],
  },
  {
    title: 'Help & Support',
    links: [
      { label: 'Terms of Privacy', href: '#' },
      { label: 'Privacy Policy', href: '#' },
      { label: 'Security', href: '#' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'Blog', href: '#' },
      { label: 'Contact', href: '#' },
    ],
  },
  {
    title: 'Social',
    links: [
      { label: 'Facebook', href: '#' },
      { label: 'Instagram', href: '#' },
      { label: 'Twitter', href: '#' },
    ],
  },
]

const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="footer">
    <div class="footer__inner">
      <div class="footer-upper">
        <RouterLink to="/" class="footer__logo" aria-label="EasyMart home">
          <img :src="logo" alt="EasyMart" width="134" height="32" />
        </RouterLink>

        <nav class="footer-content" aria-label="Footer navigation">
          <section
            v-for="section in footerSections"
            :key="section.title"
            class="footer-content__item"
          >
            <div class="footer-content__heading">
              <h2>{{ section.title }}</h2>
            </div>

            <div class="footer-content__content">
              <a v-for="link in section.links" :key="link.label" :href="link.href">
                {{ link.label }}
              </a>
            </div>
          </section>
        </nav>
      </div>

      <div class="footer-trademark">
        <span>All rights reserved.</span>
        <span>© {{ currentYear }} EasyMart</span>
      </div>
    </div>
  </footer>
</template>
