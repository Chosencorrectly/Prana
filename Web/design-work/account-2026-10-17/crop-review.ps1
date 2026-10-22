Add-Type -AssemblyName System.Drawing
$taskDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$bitmap = [System.Drawing.Bitmap]::FromFile((Join-Path $taskDir 'board.png'))
$sets = @{
 'a'=@(0,0, 0,1, 0,3)
 'b'=@(1,0, 1,4, 1,6)
 'c'=@(2,0, 2,3, 2,4)
 'd'=@(3,2, 3,6, 3,11)
 'e'=@(4,0, 4,2, 4,5)
 'f'=@(5,0, 5,2, 5,4)
 'g'=@(6,0, 6,1, 6,3)
 'h'=@(7,0, 7,2, 7,3)
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
 $plate.Save((Join-Path $taskDir ('plate-'+$key+'.png')))
 $g.Dispose(); $plate.Dispose()
}
$thumbnail = New-Object System.Drawing.Bitmap(1196,2376)
$g=[System.Drawing.Graphics]::FromImage($thumbnail)
$g.DrawImage($bitmap,0,0,1196,2376)
$thumbnail.Save((Join-Path $taskDir 'board-overview.png'))
$g.Dispose();$thumbnail.Dispose();$bitmap.Dispose()
