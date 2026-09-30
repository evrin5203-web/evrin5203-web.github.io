// Additional sections share the existing React runtime and project data.
export function makeFashionSections(jsx, projects) {
  const h = (tag, props, ...children) => jsx(tag, children.length ? {...props, children: children.flat()} : props);
  const heading = (label, title) => h('div', {className: 'section-heading'},
    h('p', {className: 'eyebrow'}, label), h('h2', {}, title));
  const merch = h('section', {className: 'merch section-pad', id: 'merch'},
    heading('Мерч и сувенирная продукция', 'Мерч. От идеи до реализации'),
    h('p', {className: 'section-intro'}, 'Разрабатываем мерч для брендов и организаций: от концепции и дизайна до готового тиража.'),
    h('div', {className: 'merch-gallery', 'aria-label': 'Примеры работ'},
      ['Кабинет редкостей', 'Путешественники', 'Эскондида'].map((title, index) =>
        h('details', {className: 'merch-project', key: title},
          h('summary', {}, h('span', {className: 'merch-preview', 'aria-hidden': true}, 'Скоро'),
            h('span', {className: 'merch-caption'}, h('span', {}, `0${index+1}`), h('strong', {}, title), h('span', {'aria-hidden': true}, '+'))),
          h('p', {className: 'merch-pending'}, 'Фотографии проекта скоро появятся здесь.')))));
  const awards = projects.flatMap(project => (project.awards || []).map(award => ({...award, projectTitle: project.title})));
  const awardsSection = h('section', {className: 'awards-section section-pad', id: 'awards'},
    heading('Признание', 'Награды'),
    h('div', {className: 'awards-grid'}, awards.map(award =>
      h('a', {className: 'award-card', href: award.url, target: '_blank', rel: 'noopener noreferrer', key: award.url},
        h('img', {src: award.image, alt: '', loading: 'lazy'}),
        h('div', {}, h('p', {className: 'award-project'}, award.projectTitle), h('h3', {}, award.name), h('p', {}, award.result)),
        h('span', {'aria-hidden': true}, '↗')))));
  const media = h('section', {className: 'media-section section-pad', id: 'media'},
    heading('Публикации', 'Упоминания в медиа'),
    h('div', {className: 'media-grid'}, [1,2,3].map(index =>
      h('article', {className: 'media-card', key: index},
        h('span', {className: 'eyebrow'}, `0${index} / Скоро`),
        h('h3', {}, 'Публикация о лаборатории'),
        h('p', {}, 'Здесь появятся название издания, дата и ссылка на материал.')))));
  return {merch, awards: awardsSection, media};
}
