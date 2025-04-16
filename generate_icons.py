from PIL import Image, ImageDraw
import os

def create_icon(size):
    # Create a new image with a transparent background
    image = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)
    
    # Draw a red circle
    margin = size // 8
    draw.ellipse([margin, margin, size - margin, size - margin], fill='#ff0000')
    
    # Draw a white search icon
    icon_size = size // 2
    icon_margin = (size - icon_size) // 2
    draw.ellipse([icon_margin, icon_margin, icon_margin + icon_size, icon_margin + icon_size], 
                 outline='white', width=size//16)
    # Draw the search handle
    handle_length = size // 4
    handle_start = icon_margin + icon_size * 0.7
    draw.line([handle_start, handle_start, handle_start + handle_length, handle_start + handle_length],
              fill='white', width=size//16)
    
    return image

def main():
    # Create icons directory if it doesn't exist
    if not os.path.exists('icons'):
        os.makedirs('icons')
    
    # Generate icons of different sizes
    sizes = [16, 48, 128]
    for size in sizes:
        icon = create_icon(size)
        icon.save(f'icons/icon{size}.png')

if __name__ == '__main__':
    main() 