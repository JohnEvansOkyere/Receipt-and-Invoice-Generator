"""
File upload routes
"""
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from fastapi.responses import JSONResponse
import os
import uuid
from pathlib import Path
import io
from app import auth

# Try to import PIL, but make it optional
try:
    from PIL import Image
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False

router = APIRouter()

# Create uploads directory if it doesn't exist
UPLOAD_DIR = Path("uploads/logos")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# Allowed image types
ALLOWED_EXTENSIONS = {".png", ".jpg", ".jpeg", ".gif", ".webp"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

def is_allowed_file(filename: str) -> bool:
    """Check if file extension is allowed"""
    ext = Path(filename).suffix.lower()
    return ext in ALLOWED_EXTENSIONS

@router.post("/logo")
async def upload_logo(
    file: UploadFile = File(...),
    current_user = Depends(auth.get_current_user)
):
    """Upload a logo image file"""
    
    # Validate file extension
    if not is_allowed_file(file.filename):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # Generate unique filename
    file_ext = Path(file.filename).suffix.lower()
    unique_filename = f"{current_user.id}_{uuid.uuid4().hex}{file_ext}"
    file_path = UPLOAD_DIR / unique_filename
    
    try:
        # Read file content
        contents = await file.read()
        
        # Check file size
        if len(contents) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File too large. Maximum size is {MAX_FILE_SIZE / 1024 / 1024}MB"
            )
        
        # Validate and process image (if PIL is available)
        if PIL_AVAILABLE:
            try:
                image = Image.open(io.BytesIO(contents))
                # Convert to RGB if necessary (handles RGBA, P, etc.)
                if image.mode in ('RGBA', 'LA', 'P'):
                    rgb_image = Image.new('RGB', image.size, (255, 255, 255))
                    if image.mode == 'P':
                        image = image.convert('RGBA')
                    rgb_image.paste(image, mask=image.split()[-1] if image.mode == 'RGBA' else None)
                    image = rgb_image
                elif image.mode != 'RGB':
                    image = image.convert('RGB')
                
                # Resize if too large (max 500px width/height while maintaining aspect ratio)
                max_size = 500
                if image.width > max_size or image.height > max_size:
                    image.thumbnail((max_size, max_size), Image.Resampling.LANCZOS)
                
                # Save the processed image
                image.save(file_path, 'JPEG', quality=85, optimize=True)
                
            except Exception as e:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid image file: {str(e)}"
                )
        else:
            # If PIL is not available, just save the file as-is
            # Basic validation: check if it's a valid image by checking magic bytes
            if not contents.startswith(b'\xff\xd8') and not contents.startswith(b'\x89PNG'):
                # Try to check for other image formats
                is_image = False
                if contents.startswith(b'GIF'):
                    is_image = True
                elif contents.startswith(b'RIFF') and b'WEBP' in contents[:20]:
                    is_image = True
                
                if not is_image:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="File does not appear to be a valid image. Please install Pillow for better image processing."
                    )
            
            # Save file directly without processing
            with open(file_path, 'wb') as f:
                f.write(contents)
        
        # Return the URL path (relative to the API)
        logo_url = f"/api/uploads/logos/{unique_filename}"
        
        return JSONResponse({
            "logo_url": logo_url,
            "filename": unique_filename
        })
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error uploading file: {str(e)}"
        )
