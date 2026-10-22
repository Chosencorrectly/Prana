param([string]$Source='board-round1.png',[string]$Prefix='round1')
Add-Type -AssemblyName System.Drawing
$taskDir=Split-Path -Parent $MyInvocation.MyCommand.Path
$bitmap=[System.Drawing.Bitmap]::FromFile((Join-Path $taskDir $Source))
$sets=@{a=@(0,1,0,2,0,4);b=@(1,0,1,1,1,6);c=@(2,0,2,1,2,4);d=@(3,0,3,2,3,3);e=@(4,0,4,2,4,7);f=@(5,0,5,2,5,6);extra=@(1,2,2,3,3,4)}
foreach($key in $sets.Keys){$plate=New-Object System.Drawing.Bitmap(1330,1270);$g=[System.Drawing.Graphics]::FromImage($plate);$g.Clear([System.Drawing.Color]::FromArgb(8,8,8));$p=$sets[$key];for($j=0;$j -lt 3;$j++){$r=New-Object System.Drawing.Rectangle((80+$p[$j*2+1]*486),(490+$p[$j*2]*1400),430,1270);$g.DrawImage($bitmap,(New-Object System.Drawing.Rectangle(($j*450),0,430,1270)),$r,[System.Drawing.GraphicsUnit]::Pixel)};$plate.Save((Join-Path $taskDir "$Prefix-$key.png"));$g.Dispose();$plate.Dispose()}
$thumb=New-Object System.Drawing.Bitmap(1132,2220);$g=[System.Drawing.Graphics]::FromImage($thumb);$g.DrawImage($bitmap,0,0,1132,2220);$thumb.Save((Join-Path $taskDir "$Prefix-overview.png"));$g.Dispose();$thumb.Dispose();$bitmap.Dispose()
