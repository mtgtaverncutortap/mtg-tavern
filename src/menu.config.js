// The menu. Edit this file to change what shows on the site.
//
// Each category has a title and a list of items. Each item can have:
//   name:        required
//   price:       optional text such as '$5'. Leave it out to show no price.
//   description: optional short line under the name
//   link:        optional web address that makes the name a link
export const menu = [
  {
    title: 'Food & Treats',
    items: [
      { name: 'Pizza', price: '$3', description: 'Sold by the slice.' },
      { name: 'Tomatillo wheels', price: '$6' },
      {
        name: 'Snugglebunz',
        price: '$4',
        description: 'Warm & sweet delights.',
        link: 'https://www.originalsnugglebunz.com/',
      },
    ],
  },
  {
    title: 'Drinks',
    items: [
      { name: 'Coffee', price: '$3' },
      { name: 'Butterbeer', price: '$5' },
      { name: 'Energy drinks', price: '$4' },
    ],
  },
]
