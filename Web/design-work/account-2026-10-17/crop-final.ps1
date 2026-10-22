Add-Type -AssemblyName System.Drawing
$taskDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$bitmap = [System.Drawing.Bitmap]::FromFile((Join-Path $taskDir 'board-final.png'))
$sets = @{
 'a'=@(0,0, 0,1, 0,3)
 'b'=@(1,5, 1,6, 1,10)
 'c'=@(2,7, 2,11, 2,4)
 'd'=@(3,2, 3,6, 3,11)
 'e'=@(4,0, 4,2, 4,5)
 'f'=@(5,2, 6,5, 6,8)
 'g'=@(6,0, 6,1, 6,3)
 'h'=@(7,2, 7,3, 7,8)
}
foreach ($key in $sets.Keys) {
 $plate = New-Object System.Drawing.Bitmap(1330,1270)
 $g = [System.Drawing.Graphics]::FromImage($plate)
 $g.Clear([System.Drawing.Color]::FromArgb(8,8,8))
 $positions=$sets[$key]
 for($j=0;$j -lt 3;$j++) {
  $rect = New-Object System.Drawing.Rectangle((80 + $positions[$j*2+1]*486),(570 + $positions[$j*2]*1410),430,1270)
  $g.DrawImage($bitmap,(New-Object System.Drawing.Rectangle(($j*450),0,430,1270)),$rect,[System.Drawing.GraphicsUnit]::Pixel)
 }
 $plate.Save((Join-Path $taskDir ('final-plate-'+$key+'.png')))
 $g.Dispose(); $plate.Dispose()
}
$thumbnail = New-Object System.Drawing.Bitmap(1196,2376)
$g=[System.Drawing.Graphics]::FromImage($thumbnail)
$g.DrawImage($bitmap,0,0,1196,2376)
$thumbnail.Save((Join-Path $taskDir 'board-final-overview.png'))
$g.Dispose();$thumbnail.Dispose();$bitmap.Dispose()

