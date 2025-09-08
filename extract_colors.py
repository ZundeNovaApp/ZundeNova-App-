from PIL import Image
import numpy as np
from collections import Counter

img = Image.open('/home/ubuntu/attachments/84c9bcf6-afce-442d-babe-190c6ecc9fd7/IMG_20250725_212658.png')
img_rgb = img.convert('RGB')

img_array = np.array(img_rgb)

pixels = img_array.reshape(-1, 3)

filtered_colors = []
for pixel in pixels:
    if not (pixel[0] < 50 and pixel[1] < 50 and pixel[2] < 50) and not (pixel[0] > 240 and pixel[1] > 240 and pixel[2] > 240):
        color_hex = '#{:02x}{:02x}{:02x}'.format(pixel[0], pixel[1], pixel[2])
        filtered_colors.append(color_hex)

color_counts = Counter(filtered_colors)

print('ZundeNova Brand Colors (excluding background):')
print('=' * 50)
for i, (color, count) in enumerate(color_counts.most_common(15)):
    print(f'{i+1}. {color} (used {count} times)')

green_colors = []
yellow_colors = []
teal_colors = []

for pixel in pixels:
    r, g, b = pixel
    if g > 100 and g > r and g > b and r < 150:
        color_hex = '#{:02x}{:02x}{:02x}'.format(r, g, b)
        green_colors.append(color_hex)
    elif r > 150 and g > 150 and b < 100:
        color_hex = '#{:02x}{:02x}{:02x}'.format(r, g, b)
        yellow_colors.append(color_hex)
    elif r < 100 and g > 100 and b > 100:
        color_hex = '#{:02x}{:02x}{:02x}'.format(r, g, b)
        teal_colors.append(color_hex)

print('\nGreen Colors Found:')
green_counts = Counter(green_colors)
for color, count in green_counts.most_common(5):
    print(f'  {color} (used {count} times)')

print('\nYellow Colors Found:')
yellow_counts = Counter(yellow_colors)
for color, count in yellow_counts.most_common(5):
    print(f'  {color} (used {count} times)')

print('\nTeal Colors Found:')
teal_counts = Counter(teal_colors)
for color, count in teal_counts.most_common(5):
    print(f'  {color} (used {count} times)')
