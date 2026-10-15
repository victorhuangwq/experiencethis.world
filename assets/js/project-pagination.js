(() => {
  const list = document.querySelector('#project-list');
  if (!list) return;

  const projects = [...list.querySelectorAll('.post-row')];
  const configuredSize = Number(list.dataset.pageSize);
  const pageSize = Number.isInteger(configuredSize) && configuredSize > 0 ? configuredSize : 6;
  const pageCount = Math.ceil(projects.length / pageSize);
  if (pageCount <= 1) return;

  const navigation = document.querySelector('.project-pagination');
  const links = navigation.querySelector('.pagination-links');
  const status = navigation.querySelector('.pagination-status');
  const heading = document.querySelector('#more-projects');
  let currentPage;

  function requestedPage() {
    const value = Number(new URL(location.href).searchParams.get('page'));
    return Number.isInteger(value) && value > 0 ? Math.min(value, pageCount) : 1;
  }

  function pageUrl(number) {
    const url = new URL(location.href);
    if (number === 1) url.searchParams.delete('page');
    else url.searchParams.set('page', number);
    url.hash = 'more-projects';
    return url.pathname + url.search + url.hash;
  }

  function control(label, number, disabled = false) {
    const element = document.createElement(disabled ? 'span' : 'a');
    element.textContent = label;
    if (disabled) element.setAttribute('aria-disabled', 'true');
    else {
      element.href = pageUrl(number);
      element.dataset.page = number;
      if (typeof label === 'number') {
        element.setAttribute('aria-label', `Page ${number}`);
        if (number === currentPage) element.setAttribute('aria-current', 'page');
      }
    }
    return element;
  }

  function render(number) {
    currentPage = number;
    const start = (number - 1) * pageSize;
    projects.forEach((project, index) => {
      project.hidden = index < start || index >= start + pageSize;
    });
    status.textContent = `Showing ${start + 1}–${Math.min(start + pageSize, projects.length)} of ${projects.length} projects`;
    links.replaceChildren(control('Previous', number - 1, number === 1));
    for (let page = 1; page <= pageCount; page++) links.append(control(page, page));
    links.append(control('Next', number + 1, number === pageCount));
    navigation.hidden = false;
  }

  links.addEventListener('click', event => {
    const link = event.target.closest('a[data-page]');
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const number = Number(link.dataset.page);
    if (number === currentPage) return;
    history.pushState(null, '', link.href);
    render(number);
    heading.focus({ preventScroll: true });
    heading.scrollIntoView({ block: 'start' });
  });

  window.addEventListener('popstate', () => render(requestedPage()));
  render(requestedPage());
})();
