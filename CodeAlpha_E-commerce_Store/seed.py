import os
import django
import urllib.request
from django.core.files.base import ContentFile

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce.settings')
django.setup()

from store.models import Category, Product
from decimal import Decimal

def download_image(url, filename):
    print(f"Downloading {filename}...")
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        response = urllib.request.urlopen(req)
        return ContentFile(response.read(), name=filename)
    except Exception as e:
        print(f"Failed to download {filename}: {e}")
        return None

def seed():
    print("Clearing old data...")
    Category.objects.all().delete()
    Product.objects.all().delete()

    print("Creating categories...")
    tech = Category.objects.create(name='Technology', slug='technology')
    apparel = Category.objects.create(name='Apparel', slug='apparel')
    home = Category.objects.create(name='Home', slug='home')

    print("Creating products...")
    
    watch_img = download_image('https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&q=80', 'watch.jpg')
    Product.objects.create(
        category=tech,
        name='AeroBlade Smart Watch',
        slug='aeroblade-smart-watch',
        description='A beautifully crafted smartwatch with heart rate monitoring, GPS, and a stunning OLED display. Designed for the professionals.',
        price=Decimal('299.99'),
        image=watch_img,
        available=True
    )

    headphone_img = download_image('https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80', 'headphones.jpg')
    Product.objects.create(
        category=tech,
        name='Noise Cancelling Headphones Pro',
        slug='noise-cancelling-headphones-pro',
        description='Immerse yourself in pure audio bliss with active noise cancellation and 40-hour battery life.',
        price=Decimal('349.00'),
        image=headphone_img,
        available=True
    )

    backpack_img = download_image('https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80', 'backpack.jpg')
    Product.objects.create(
        category=apparel,
        name='Premium Minimalist Backpack',
        slug='premium-minimalist-backpack',
        description='Crafted from water-resistant materials, featuring hidden pockets and ergonomic back support. Perfect for the urban commuter.',
        price=Decimal('120.00'),
        image=backpack_img,
        available=True
    )

    mug_img = download_image('https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=800&q=80', 'mug.jpg')
    Product.objects.create(
        category=home,
        name='Smart Ceramic Coffee Mug',
        slug='smart-ceramic-coffee-mug',
        description='Keep your coffee at the perfect temperature all day long with app-controlled heating.',
        price=Decimal('89.50'),
        image=mug_img,
        available=True
    )

    print("Seed complete!")

if __name__ == '__main__':
    seed()
