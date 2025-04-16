from PIL import Image, ImageDraw
import os

def create_icon(size, output_path):
    # Create a new image with white background
    image = Image.new('RGB', (size, size), 'white')
    draw = ImageDraw.Draw(image)
    
    # Calculate dimensions
    padding = size // 4
    rect_size = size - (2 * padding)
    
    # Draw a red square with rounded corners
    draw.rounded_rectangle(
        [(padding, padding), (size - padding, size - padding)],
        fill='#FF0000',
        radius=size//8
    )
    
    # Draw a white magnifying glass
    circle_size = rect_size // 2
    circle_pos = (padding + circle_size//2, padding + circle_size//2)
    draw.ellipse(
        [(circle_pos[0] - circle_size//2, circle_pos[1] - circle_size//2),
         (circle_pos[0] + circle_size//2, circle_pos[1] + circle_size//2)],
        outline='white',
        width=size//16
    )
    
    # Draw handle
    handle_start = (circle_pos[0] + circle_size//3, circle_pos[1] + circle_size//3)
    handle_end = (size - padding - size//8, size - padding - size//8)
    draw.line([handle_start, handle_end], fill='white', width=size//16)
    
    # Save the image
    image.save(output_path, 'PNG')

def main():
    # Create icons directory if it doesn't exist
    if not os.path.exists('icons'):
        os.makedirs('icons')
    
    # Generate icons in different sizes
    sizes = {
        16: 'icon16.png',
        48: 'icon48.png',
        128: 'icon128.png'
    }
    
    for size, filename in sizes.items():
        output_path = os.path.join('icons', filename)
        create_icon(size, output_path)
        print(f'Generated {output_path}')

if __name__ == '__main__':
    main() 