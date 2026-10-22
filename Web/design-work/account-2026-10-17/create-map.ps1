Add-Type -AssemblyName System.Drawing
$taskDir=Split-Path -Parent $MyInvocation.MyCommand.Path
$lat=-8.6262258
$lon=115.1648920
$zoom=15
$n=[Math]::Pow(2,$zoom)
$xf=($lon+180)/360*$n
$rad=$lat*[Math]::PI/180
$yf=(1-[Math]::Log([Math]::Tan($rad)+1/[Math]::Cos($rad))/[Math]::PI)/2*$n
$cx=[int][Math]::Floor($xf)
$cy=[int][Math]::Floor($yf)
$mosaic=New-Object System.Drawing.Bitmap(768,768)
$g=[System.Drawing.Graphics]::FromImage($mosaic)
$sourceUrls=@()
for($dy=-1;$dy -le 1;$dy++) {
 for($dx=-1;$dx -le 1;$dx++) {
  $tx=$cx+$dx;$ty=$cy+$dy
  $url="https://tile.openstreetmap.org/$zoom/$tx/$ty.png"
  $tilePath=Join-Path $taskDir "map-tile-$dx-$dy.png"
  Invoke-WebRequest -Uri $url -OutFile $tilePath -Headers @{'User-Agent'='PranaDesignPreview/1.0'}
  $tile=[System.Drawing.Bitmap]::FromFile($tilePath)
  $g.DrawImage($tile,($dx+1)*256,($dy+1)*256,256,256)
  $tile.Dispose()
  $sourceUrls+=$url
 }
}
$g.Dispose()
$px=256+($xf-$cx)*256
$py=256+($yf-$cy)*256
$rect=New-Object System.Drawing.Rectangle(([int]$px-256),([int]$py-256),512,512)
$map=$mosaic.Clone($rect,$mosaic.PixelFormat)
$map.Save((Join-Path $taskDir 'padonan-map.png'))
$map.Dispose();$mosaic.Dispose()
@{source='OpenStreetMap standard basemap';attribution='© OpenStreetMap contributors';coordinates=@{latitude=$lat;longitude=$lon;zoom=$zoom};geocoder='https://nominatim.openstreetmap.org/search?q=Jalan%20Raya%20Padonan%2C%20Bali%2C%20Indonesia&format=jsonv2&limit=1';scope='Road location only; exact building, courier and service boundary unverified';tiles=$sourceUrls} | ConvertTo-Json -Depth 4 | Set-Content -LiteralPath (Join-Path $taskDir 'map-provenance.json') -Encoding utf8

