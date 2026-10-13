# Run after `bash _dev/site build`, using `bash _dev/site check`.
require 'yaml'
require 'date'
require 'time'
require 'uri'
require 'cgi'
require 'nokogiri'

ROOT = ENV.fetch('SITE_CHECK_SOURCE', File.expand_path('..', __dir__))
OUTPUT = ENV.fetch('SITE_CHECK_DESTINATION', File.join(ROOT, '_site'))

def check(condition, message)
  raise message unless condition
end

def metadata(path)
  text = File.read(path)
  return {} unless text.start_with?("---\n")
  data = YAML.safe_load(text.split(/^---\s*$/, 3)[1], permitted_classes: [Date, Time], aliases: true) || {}
  data['date'] = Time.parse(data['date'].to_s) if data['date']
  data
end

def html(path)
  file = File.join(OUTPUT, path.sub(%r{^/}, ''))
  file = File.join(file, 'index.html') if path.end_with?('/')
  check(File.file?(file), "Missing built page: #{path}")
  Nokogiri::HTML(File.read(file))
end

def post_url(path, data)
  return data['permalink'] if data['permalink']
  categories = Array(data['categories']).flat_map { |category| category.split }
  date = data.fetch('date')
  date = Time.parse(date.to_s) unless date.respond_to?(:strftime)
  slug = File.basename(path).sub(/^\d{4}-\d{2}-\d{2}-/, '').sub(/\.(md|markdown)$/, '')
  '/' + (categories + [date.strftime('%Y/%m/%d'), slug + '.html']).join('/')
end

# _config.yml has no front matter delimiter.
config = YAML.safe_load(File.read(File.join(ROOT, '_config.yml')), permitted_classes: [Date, Time], aliases: true)
posts = Dir[File.join(ROOT, '_posts', '*.{md,markdown}')].map do |path|
  data = metadata(path)
  data.merge('source' => path, 'url' => post_url(path, data))
end
visible = posts.reject { |post| post['published'] == false || post['hidden'] == true }.sort_by { |post| post.fetch('date') }.reverse
check(!visible.empty?, 'Expected published articles for this site')

archive = html('/writing/')
archive_urls = archive.css('.post-row').map { |row| row['data-post-url'] }
check(archive_urls == visible.map { |post| post['url'] }, 'Writing must contain every published article once, newest first')

home = html('/')
featured = visible.select { |post| post['featured'] == true }.take(config.fetch('home_feature_limit', 3))
featured_urls = featured.map { |post| post['url'] }
feature_links = home.css('.home-feature h2 a').map { |link| link['href'] }
check(feature_links == featured_urls, 'Homepage features must show the newest flagged posts up to the configured limit')
check(home.css('.home-features').size == (featured.empty? ? 0 : 1), 'Omit the feature section when no features are displayed')
check(home.css('.home-feature--compact').size == [featured.size - 1, 0].max, 'Additional features must use the compact layout')
expected_recent = visible.reject { |post| featured_urls.include?(post['url']) }.take(config.fetch('home_post_limit', 3))
check(home.css('.post-row').map { |row| row['data-post-url'] } == expected_recent.map { |post| post['url'] }, 'Recent writing must exclude every displayed feature and sort automatically')

projects = visible.select { |post| Array(post['categories']).join(' ').split.include?('projects') }
projects += Dir[File.join(ROOT, '_projects', '*.md')].map { |path| metadata(path) }.reject { |project| project['hidden'] == true || project['published'] == false }
projects.sort_by! { |project| project.fetch('date') }
projects.reverse!
selected = projects.select { |project| project['selected'] == true }
other = projects.reject { |project| project['selected'] == true }
project_page = html('/projects/')
check(project_page.css('.project-feature').size == selected.size, 'Selected work must follow project metadata')
expected_project_urls = other.map { |project| project['link_only'] ? project['project_url'] : project['url'] }
check(project_page.css('.post-row').map { |row| row['data-post-url'] } == expected_project_urls, 'Projects must retain professional and toy work in chronological order')

travel = visible.select { |post| Array(post['categories']).join(' ').split.include?('travel') }
check(html('/travel/').css('.travel-entry h2 a').map { |link| link['href'] } == travel.map { |post| post['url'] }, 'Travel must be a view of the original articles')

feed = File.read(File.join(OUTPUT, 'feed.xml'))
posts.each do |post|
  if post['hidden'] || post['published'] == false
    check(post['published'] == false, "Use published: false for drafts: #{post['source']}")
    check(!File.file?(File.join(OUTPUT, post['url'].sub(%r{^/}, ''))), "Draft was published: #{post['url']}")
    check(!feed.include?(post['url']), "Draft leaked into RSS: #{post['url']}")
  else
    html(post['url'])
  end
end

check(!File.exist?(File.join(OUTPUT, '_archive')), 'Archived writing must remain excluded from the public build')
['docs', 'README.md', 'README.html'].each do |path|
  check(!File.exist?(File.join(OUTPUT, path)), "Repository documentation must not be published: #{path}")
end
Dir[File.join(ROOT, '_archive', '*.{md,markdown}')].each do |path|
  data = metadata(path)
  next unless data['date']
  url = post_url(path, data)
  check(!File.file?(File.join(OUTPUT, url.sub(%r{^/}, ''))), "Archived article was published: #{url}")
  check(!feed.include?(url), "Archived article leaked into RSS: #{url}")
end

{
  '/category/projects.html' => '/projects/',
  '/category/travel.html' => '/travel/',
  '/about.html' => '/about/',
  '/page2/' => '/writing/',
  '/projects/school/2020/12/06/ReportChat.html' => '/projects/2021/12/06/ReportChat.html'
}.each do |old_url, new_url|
  redirect = html(old_url).at_css('meta[http-equiv="refresh"]')
  check(redirect && redirect['content'].end_with?(new_url), "Legacy URL redirect is missing: #{old_url}")
end

# Validate references without fetching external sites. Check every generated
# page, including the existing standalone tools, against the built files.
missing = []
Dir[File.join(OUTPUT, '**', '*.html')].each do |file|
  document = Nokogiri::HTML(File.read(file))
  document.css('[href], img[src], script[src]').each do |node|
    raw = node['href'] || node['src']
    next if !raw || raw.empty? || raw.start_with?('mailto:', 'tel:', 'data:', 'javascript:', '//')
    if raw.start_with?('http://', 'https://')
      uri = URI.parse(raw)
      next unless ['experiencethis.world', 'www.experiencethis.world'].include?(uri.host)
      raw = uri.request_uri
    end
    url_path = CGI.unescape(raw.split(/[?#]/, 2).first || '')
    target = if url_path.empty?
      file
    elsif url_path.start_with?('/')
      File.join(OUTPUT, url_path.sub(%r{^/}, ''))
    else
      File.expand_path(url_path, File.dirname(file))
    end
    target = File.join(target, 'index.html') if File.directory?(target)
    # GitHub Pages resolves extensionless permalinks to their HTML files.
    target += '.html' if !File.file?(target) && File.extname(target).empty? && File.file?(target + '.html')
    missing << "#{file.sub(OUTPUT + '/', '')}: #{raw}" unless File.file?(target)
  end
end
check(missing.empty?, "Broken local links/assets:\n#{missing.join("\n")}")

puts "Passed: #{visible.size} published articles, #{projects.size} projects, feature and automatic ordering, draft exclusion, legacy redirects, and local links/assets."
