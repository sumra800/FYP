import React, { useState, useRef, useEffect } from 'react';
import './AvatarBuilder.css';

const AvatarBuilder = ({ onSave, onClose, initialAvatar }) => {
  const canvasRef = useRef(null);
  const [activeCategory, setActiveCategory] = useState('face');
  const [avatar, setAvatar] = useState({
    gender: initialAvatar?.gender || 'female',
    faceShape: initialAvatar?.faceShape || 'oval',
    skinTone: initialAvatar?.skinTone || '#f5d5b8',
    hairStyle: initialAvatar?.hairStyle || 'short',
    hairColor: initialAvatar?.hairColor || '#2c1b18',
    eyeStyle: initialAvatar?.eyeStyle || 'normal',
    eyeColor: initialAvatar?.eyeColor || '#4a4a4a',
    eyebrowStyle: initialAvatar?.eyebrowStyle || 'normal',
    noseStyle: initialAvatar?.noseStyle || 'normal',
    mouthStyle: initialAvatar?.mouthStyle || 'smile',
    facialHair: initialAvatar?.facialHair || 'none',
    facialHairColor: initialAvatar?.facialHairColor || '#2c1b18',
    glassesStyle: initialAvatar?.glassesStyle || 'none',
    accessory: initialAvatar?.accessory || 'none',
    clothingStyle: initialAvatar?.clothingStyle || 'tshirt',
    clothingColor: initialAvatar?.clothingColor || '#FFFC00',
    backgroundStyle: initialAvatar?.backgroundStyle || 'snapchat'
  });

  const categories = [
    { id: 'face', label: '😊 Face', icon: '👤' },
    { id: 'hair', label: '💇 Hair', icon: '✂️' },
    { id: 'eyes', label: '👀 Eyes', icon: '👁️' },
    { id: 'nose', label: '👃 Nose & Mouth', icon: '😃' },
    { id: 'facial', label: '🧔 Facial Hair', icon: '🧔' },
    { id: 'accessories', label: '🕶️ Accessories', icon: '👓' },
    { id: 'clothing', label: '👕 Clothing', icon: '👔' },
    { id: 'background', label: '🎨 Background', icon: '🌈' }
  ];

  const faceShapes = ['oval', 'round', 'square', 'heart', 'long'];
  const skinTones = [
    { name: 'Light', color: '#f5d5b8' },
    { name: 'Fair', color: '#e8beac' },
    { name: 'Medium', color: '#dda885' },
    { name: 'Olive', color: '#c68642' },
    { name: 'Brown', color: '#8d5524' },
    { name: 'Dark', color: '#5c4033' }
  ];

  // Gender-specific hairstyles
  const femaleHairStyles = ['long', 'wavy', 'curly', 'ponytail', 'bob', 'pixie', 'layers', 'braids', 'bun', 'bangs', 'beach-waves'];
  const maleHairStyles = ['short', 'buzzcut', 'crew-cut', 'side-part', 'slick-back', 'messy', 'spiky', 'mohawk', 'bald', 'fade'];
  
  const hairColors = ['#2c1b18', '#4a3728', '#b89778', '#c93305', '#ffd700', '#000000', '#e91e63', '#9c27b0', '#2196f3'];
  const eyeStyles = ['normal', 'happy', 'wink', 'closed', 'surprised', 'loving', 'sleepy'];
  const eyeColors = ['#4a4a4a', '#2e7d32', '#1976d2', '#795548', '#000000', '#00bcd4'];
  
  // Gender-specific eyebrows
  const femaleEyebrowStyles = ['thin', 'normal', 'arched', 'straight', 'soft'];
  const maleEyebrowStyles = ['normal', 'thick', 'bushy', 'raised', 'angry'];
  
  const noseStyles = ['normal', 'small', 'large', 'button', 'pointed'];
  const mouthStyles = ['smile', 'grin', 'neutral', 'surprised', 'laugh', 'smirk', 'kiss'];
  
  // Gender-specific facial hair
  const femaleFacialHairStyles = ['none'];
  const maleFacialHairStyles = ['none', 'beard', 'goatee', 'mustache', 'stubble', 'full', 'soul-patch', 'chin-strap'];
  
  const glassesStyles = ['none', 'round', 'square', 'sunglasses', 'aviator', 'cat-eye'];
  
  // Gender-specific accessories
  const femaleAccessories = ['none', 'earrings', 'headband', 'flower', 'bow', 'tiara', 'hair-clip', 'necklace'];
  const maleAccessories = ['none', 'hat', 'cap', 'beanie', 'bandana'];
  
  // Gender-specific clothing
  const femaleClothingStyles = ['tshirt', 'blouse', 'sweater', 'dress', 'tank-top', 'cardigan', 'off-shoulder'];
  const maleClothingStyles = ['tshirt', 'hoodie', 'shirt', 'sweater', 'vneck', 'polo', 'jacket'];
  
  const clothingColors = ['#FFFC00', '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#000000', '#ffffff', '#ff69b4'];
  const backgrounds = ['snapchat', 'gradient1', 'gradient2', 'gradient3', 'solid1', 'solid2', 'solid3', 'purple', 'blue', 'pink'];

  // Get gender-specific options
  const getHairStyles = () => avatar.gender === 'female' ? femaleHairStyles : maleHairStyles;
  const getEyebrowStyles = () => avatar.gender === 'female' ? femaleEyebrowStyles : maleEyebrowStyles;
  const getFacialHairStyles = () => avatar.gender === 'female' ? femaleFacialHairStyles : maleFacialHairStyles;
  const getAccessories = () => avatar.gender === 'female' ? femaleAccessories : maleAccessories;
  const getClothingStyles = () => avatar.gender === 'female' ? femaleClothingStyles : maleClothingStyles;

  useEffect(() => {
    drawAvatar();
  }, [avatar]);

  const drawAvatar = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    drawBackground(ctx);
    
    // Draw clothing
    drawClothing(ctx);
    
    // Draw head
    drawHead(ctx);
    
    // Draw hair (back layer)
    if (avatar.hairStyle === 'long' || avatar.hairStyle === 'ponytail') {
      drawHairBack(ctx);
    }
    
    // Draw ears
    drawEars(ctx);
    
    // Draw face features
    drawEyebrows(ctx);
    drawEyes(ctx);
    drawNose(ctx);
    drawMouth(ctx);
    drawFacialHair(ctx);
    
    // Draw glasses
    drawGlasses(ctx);
    
    // Draw hair (front layer)
    drawHair(ctx);
    
    // Draw accessories
    drawAccessories(ctx);
  };

  const drawBackground = (ctx) => {
    const gradientMap = {
      snapchat: ['#FFFC00', '#FFEA00'],
      gradient1: ['#667eea', '#764ba2'],
      gradient2: ['#f093fb', '#f5576c'],
      gradient3: ['#4facfe', '#00f2fe'],
      solid1: ['#3b82f6', '#3b82f6'],
      solid2: ['#10b981', '#10b981'],
      solid3: ['#f59e0b', '#f59e0b'],
      purple: ['#9c27b0', '#673ab7'],
      blue: ['#2196f3', '#1976d2'],
      pink: ['#f48fb1', '#ec407a']
    };

    const colors = gradientMap[avatar.backgroundStyle] || gradientMap.snapchat;
    const gradient = ctx.createLinearGradient(0, 0, 300, 400);
    gradient.addColorStop(0, colors[0]);
    gradient.addColorStop(1, colors[1]);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 300, 400);
  };

  const drawHead = (ctx) => {
    ctx.fillStyle = avatar.skinTone;
    
    switch (avatar.faceShape) {
      case 'oval':
        ctx.beginPath();
        ctx.ellipse(150, 180, 70, 85, 0, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'round':
        ctx.beginPath();
        ctx.arc(150, 180, 75, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'square':
        ctx.fillRect(85, 105, 130, 150);
        ctx.beginPath();
        ctx.arc(85, 115, 10, Math.PI, 1.5 * Math.PI);
        ctx.arc(215, 115, 10, 1.5 * Math.PI, 0);
        ctx.arc(215, 245, 10, 0, 0.5 * Math.PI);
        ctx.arc(85, 245, 10, 0.5 * Math.PI, Math.PI);
        ctx.fill();
        break;
      case 'heart':
        ctx.beginPath();
        ctx.moveTo(150, 260);
        ctx.quadraticCurveTo(85, 220, 85, 160);
        ctx.quadraticCurveTo(85, 110, 115, 110);
        ctx.quadraticCurveTo(150, 90, 150, 120);
        ctx.quadraticCurveTo(150, 90, 185, 110);
        ctx.quadraticCurveTo(215, 110, 215, 160);
        ctx.quadraticCurveTo(215, 220, 150, 260);
        ctx.closePath();
        ctx.fill();
        break;
      case 'long':
        ctx.beginPath();
        ctx.ellipse(150, 180, 60, 95, 0, 0, Math.PI * 2);
        ctx.fill();
        break;
      default:
        ctx.beginPath();
        ctx.ellipse(150, 180, 70, 85, 0, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Neck
    ctx.fillRect(135, 250, 30, 40);
  };

  const drawEars = (ctx) => {
    ctx.fillStyle = avatar.skinTone;
    // Left ear
    ctx.beginPath();
    ctx.ellipse(85, 180, 15, 20, 0, 0, Math.PI * 2);
    ctx.fill();
    // Right ear
    ctx.beginPath();
    ctx.ellipse(215, 180, 15, 20, 0, 0, Math.PI * 2);
    ctx.fill();
  };

  const drawHairBack = (ctx) => {
    ctx.fillStyle = avatar.hairColor;
    if (avatar.hairStyle === 'long') {
      ctx.beginPath();
      ctx.ellipse(150, 140, 80, 60, 0, 0, Math.PI * 2);
      ctx.fill();
      // Long hair sides
      ctx.fillRect(70, 150, 30, 120);
      ctx.fillRect(200, 150, 30, 120);
    } else if (avatar.hairStyle === 'ponytail') {
      // Ponytail at back
      ctx.beginPath();
      ctx.ellipse(150, 100, 25, 40, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const drawHair = (ctx) => {
    ctx.fillStyle = avatar.hairColor;
    
    switch (avatar.hairStyle) {
      case 'short':
        ctx.beginPath();
        ctx.ellipse(150, 130, 75, 50, 0, 0, Math.PI, true);
        ctx.fill();
        break;
      case 'curly':
        for (let i = 0; i < 7; i++) {
          ctx.beginPath();
          ctx.arc(90 + i * 20, 120 + Math.sin(i) * 10, 15, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      case 'bald':
        break;
      case 'mohawk':
        ctx.fillRect(140, 90, 20, 60);
        ctx.beginPath();
        ctx.moveTo(150, 90);
        ctx.lineTo(140, 110);
        ctx.lineTo(160, 110);
        ctx.closePath();
        ctx.fill();
        break;
      case 'ponytail':
        ctx.beginPath();
        ctx.ellipse(150, 130, 75, 50, 0, 0, Math.PI, true);
        ctx.fill();
        break;
      case 'long':
        ctx.beginPath();
        ctx.ellipse(150, 130, 75, 50, 0, 0, Math.PI, true);
        ctx.fill();
        break;
      case 'wavy':
        ctx.beginPath();
        ctx.moveTo(80, 130);
        for (let i = 0; i < 15; i++) {
          ctx.lineTo(80 + i * 10, 130 + (i % 2 === 0 ? -10 : 10));
        }
        ctx.lineTo(220, 160);
        ctx.lineTo(220, 105);
        ctx.lineTo(80, 105);
        ctx.closePath();
        ctx.fill();
        break;
      case 'buzzcut':
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.ellipse(150, 130, 75, 45, 0, 0, Math.PI, true);
        ctx.fill();
        ctx.globalAlpha = 1;
        break;
      case 'afro':
        ctx.beginPath();
        ctx.arc(150, 125, 85, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'bob':
        ctx.beginPath();
        ctx.ellipse(150, 125, 80, 55, 0, 0, Math.PI, true);
        ctx.fill();
        ctx.fillRect(80, 140, 35, 50);
        ctx.fillRect(185, 140, 35, 50);
        break;
      case 'pixie':
        ctx.beginPath();
        ctx.ellipse(150, 135, 70, 45, 0, 0, Math.PI, true);
        ctx.fill();
        // Side swept
        ctx.fillRect(160, 125, 25, 20);
        break;
      case 'layers':
        ctx.beginPath();
        ctx.ellipse(150, 130, 75, 50, 0, 0, Math.PI, true);
        ctx.fill();
        // Layered sides
        ctx.fillRect(75, 145, 30, 70);
        ctx.fillRect(195, 145, 30, 70);
        for (let i = 0; i < 5; i++) {
          ctx.globalAlpha = 0.7;
          ctx.fillRect(75, 145 + i * 15, 30, 10);
          ctx.fillRect(195, 145 + i * 15, 30, 10);
        }
        ctx.globalAlpha = 1;
        break;
      case 'braids':
        ctx.beginPath();
        ctx.ellipse(150, 130, 75, 50, 0, 0, Math.PI, true);
        ctx.fill();
        // Left braid
        for (let i = 0; i < 4; i++) {
          ctx.beginPath();
          ctx.arc(95, 150 + i * 20, 8, 0, Math.PI * 2);
          ctx.fill();
        }
        // Right braid
        for (let i = 0; i < 4; i++) {
          ctx.beginPath();
          ctx.arc(205, 150 + i * 20, 8, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      case 'bun':
        ctx.beginPath();
        ctx.ellipse(150, 130, 70, 45, 0, 0, Math.PI, true);
        ctx.fill();
        // Bun on top
        ctx.beginPath();
        ctx.arc(150, 105, 25, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'bangs':
        // Bangs in front
        for (let i = 0; i < 9; i++) {
          ctx.fillRect(95 + i * 12, 125, 10, 25);
        }
        // Rest of hair
        ctx.beginPath();
        ctx.ellipse(150, 130, 75, 50, 0, 0, Math.PI, true);
        ctx.fill();
        break;
      case 'beach-waves':
        ctx.beginPath();
        ctx.ellipse(150, 130, 75, 50, 0, 0, Math.PI, true);
        ctx.fill();
        // Wavy sides
        for (let i = 0; i < 6; i++) {
          ctx.beginPath();
          ctx.bezierCurveTo(80, 145 + i * 15, 70, 150 + i * 15, 75, 155 + i * 15);
          ctx.stroke();
          ctx.beginPath();
          ctx.bezierCurveTo(220, 145 + i * 15, 230, 150 + i * 15, 225, 155 + i * 15);
          ctx.stroke();
        }
        break;
      case 'crew-cut':
        ctx.globalAlpha = 0.4;
        ctx.beginPath();
        ctx.ellipse(150, 130, 73, 40, 0, 0, Math.PI, true);
        ctx.fill();
        ctx.globalAlpha = 1;
        break;
      case 'side-part':
        ctx.beginPath();
        ctx.ellipse(150, 130, 75, 48, 0, 0, Math.PI, true);
        ctx.fill();
        // Part line
        ctx.strokeStyle = 'rgba(0,0,0,0.2)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(130, 120);
        ctx.lineTo(130, 145);
        ctx.stroke();
        break;
      case 'slick-back':
        ctx.beginPath();
        ctx.moveTo(85, 135);
        ctx.quadraticCurveTo(150, 110, 215, 135);
        ctx.lineTo(215, 150);
        ctx.lineTo(85, 150);
        ctx.closePath();
        ctx.fill();
        break;
      case 'messy':
        // Random messy strands
        for (let i = 0; i < 15; i++) {
          const x = 90 + Math.random() * 120;
          const y = 115 + Math.random() * 30;
          const angle = Math.random() * Math.PI;
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(angle);
          ctx.fillRect(-5, 0, 10, 20 + Math.random() * 15);
          ctx.restore();
        }
        break;
      case 'spiky':
        // Base
        ctx.beginPath();
        ctx.ellipse(150, 135, 70, 40, 0, 0, Math.PI, true);
        ctx.fill();
        // Spikes
        for (let i = 0; i < 8; i++) {
          ctx.beginPath();
          ctx.moveTo(95 + i * 15, 135);
          ctx.lineTo(100 + i * 15, 105);
          ctx.lineTo(105 + i * 15, 135);
          ctx.fill();
        }
        break;
      case 'fade':
        ctx.globalAlpha = 0.2;
        ctx.fillRect(85, 145, 20, 30);
        ctx.fillRect(195, 145, 20, 30);
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.ellipse(150, 130, 70, 42, 0, 0, Math.PI, true);
        ctx.fill();
        ctx.globalAlpha = 1;
        break;
    }
  };

  const drawEyebrows = (ctx) => {
    ctx.fillStyle = avatar.hairColor;
    ctx.strokeStyle = avatar.hairColor;
    ctx.lineWidth = 3;
    const leftBrowX = 125;
    const rightBrowX = 175;
    const browY = 155;

    switch (avatar.eyebrowStyle) {
      case 'normal':
        ctx.beginPath();
        ctx.moveTo(leftBrowX - 15, browY);
        ctx.quadraticCurveTo(leftBrowX, browY - 5, leftBrowX + 15, browY);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(rightBrowX - 15, browY);
        ctx.quadraticCurveTo(rightBrowX, browY - 5, rightBrowX + 15, browY);
        ctx.stroke();
        break;
      case 'raised':
        ctx.beginPath();
        ctx.moveTo(leftBrowX - 15, browY + 3);
        ctx.quadraticCurveTo(leftBrowX, browY - 8, leftBrowX + 15, browY);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(rightBrowX - 15, browY);
        ctx.quadraticCurveTo(rightBrowX, browY - 8, rightBrowX + 15, browY + 3);
        ctx.stroke();
        break;
      case 'angry':
        ctx.beginPath();
        ctx.moveTo(leftBrowX - 15, browY + 5);
        ctx.lineTo(leftBrowX + 15, browY - 3);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(rightBrowX - 15, browY - 3);
        ctx.lineTo(rightBrowX + 15, browY + 5);
        ctx.stroke();
        break;
      case 'thin':
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(leftBrowX - 15, browY);
        ctx.quadraticCurveTo(leftBrowX, browY - 3, leftBrowX + 15, browY);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(rightBrowX - 15, browY);
        ctx.quadraticCurveTo(rightBrowX, browY - 3, rightBrowX + 15, browY);
        ctx.stroke();
        break;
      case 'thick':
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(leftBrowX - 15, browY);
        ctx.quadraticCurveTo(leftBrowX, browY - 5, leftBrowX + 15, browY);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(rightBrowX - 15, browY);
        ctx.quadraticCurveTo(rightBrowX, browY - 5, rightBrowX + 15, browY);
        ctx.stroke();
        break;
      case 'bushy':
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(leftBrowX - 18, browY);
        ctx.lineTo(leftBrowX + 18, browY - 3);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(rightBrowX - 18, browY - 3);
        ctx.lineTo(rightBrowX + 18, browY);
        ctx.stroke();
        break;
      case 'arched':
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(leftBrowX - 15, browY + 2);
        ctx.quadraticCurveTo(leftBrowX - 5, browY - 8, leftBrowX, browY - 6);
        ctx.quadraticCurveTo(leftBrowX + 10, browY - 4, leftBrowX + 15, browY + 1);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(rightBrowX - 15, browY + 1);
        ctx.quadraticCurveTo(rightBrowX - 10, browY - 4, rightBrowX, browY - 6);
        ctx.quadraticCurveTo(rightBrowX + 5, browY - 8, rightBrowX + 15, browY + 2);
        ctx.stroke();
        break;
      case 'straight':
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(leftBrowX - 15, browY);
        ctx.lineTo(leftBrowX + 15, browY - 1);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(rightBrowX - 15, browY - 1);
        ctx.lineTo(rightBrowX + 15, browY);
        ctx.stroke();
        break;
      case 'soft':
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(leftBrowX - 15, browY);
        ctx.quadraticCurveTo(leftBrowX, browY - 4, leftBrowX + 15, browY);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(rightBrowX - 15, browY);
        ctx.quadraticCurveTo(rightBrowX, browY - 4, rightBrowX + 15, browY);
        ctx.stroke();
        break;
    }
  };

  const drawEyes = (ctx) => {
    const leftEyeX = 125;
    const rightEyeX = 175;
    const eyeY = 170;

    switch (avatar.eyeStyle) {
      case 'normal':
        // Left eye
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(leftEyeX, eyeY, 12, 15, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = avatar.eyeColor;
        ctx.beginPath();
        ctx.arc(leftEyeX, eyeY, 6, 0, Math.PI * 2);
        ctx.fill();
        // Right eye
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(rightEyeX, eyeY, 12, 15, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = avatar.eyeColor;
        ctx.beginPath();
        ctx.arc(rightEyeX, eyeY, 6, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'happy':
        ctx.strokeStyle = avatar.eyeColor;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(leftEyeX, eyeY, 10, 0, Math.PI);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(rightEyeX, eyeY, 10, 0, Math.PI);
        ctx.stroke();
        break;
      case 'wink':
        // Left eye closed
        ctx.strokeStyle = avatar.eyeColor;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(leftEyeX - 10, eyeY);
        ctx.lineTo(leftEyeX + 10, eyeY);
        ctx.stroke();
        // Right eye open
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(rightEyeX, eyeY, 12, 15, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = avatar.eyeColor;
        ctx.beginPath();
        ctx.arc(rightEyeX, eyeY, 6, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'closed':
        ctx.strokeStyle = avatar.eyeColor;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(leftEyeX - 10, eyeY);
        ctx.lineTo(leftEyeX + 10, eyeY);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(rightEyeX - 10, eyeY);
        ctx.lineTo(rightEyeX + 10, eyeY);
        ctx.stroke();
        break;
      case 'surprised':
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(leftEyeX, eyeY, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = avatar.eyeColor;
        ctx.beginPath();
        ctx.arc(leftEyeX, eyeY, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(rightEyeX, eyeY, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = avatar.eyeColor;
        ctx.beginPath();
        ctx.arc(rightEyeX, eyeY, 8, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'loving':
        ctx.fillStyle = '#ff69b4';
        ctx.beginPath();
        ctx.moveTo(leftEyeX, eyeY + 5);
        ctx.bezierCurveTo(leftEyeX - 10, eyeY - 10, leftEyeX - 5, eyeY - 15, leftEyeX, eyeY - 8);
        ctx.bezierCurveTo(leftEyeX + 5, eyeY - 15, leftEyeX + 10, eyeY - 10, leftEyeX, eyeY + 5);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(rightEyeX, eyeY + 5);
        ctx.bezierCurveTo(rightEyeX - 10, eyeY - 10, rightEyeX - 5, eyeY - 15, rightEyeX, eyeY - 8);
        ctx.bezierCurveTo(rightEyeX + 5, eyeY - 15, rightEyeX + 10, eyeY - 10, rightEyeX, eyeY + 5);
        ctx.fill();
        break;
      case 'sleepy':
        ctx.strokeStyle = avatar.eyeColor;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(leftEyeX, eyeY + 5, 10, 0.1 * Math.PI, 0.9 * Math.PI);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(rightEyeX, eyeY + 5, 10, 0.1 * Math.PI, 0.9 * Math.PI);
        ctx.stroke();
        break;
    }
  };

  const drawNose = (ctx) => {
    ctx.fillStyle = 'rgba(0,0,0,0.1)';
    const noseX = 150;
    const noseY = 190;

    switch (avatar.noseStyle) {
      case 'normal':
        ctx.beginPath();
        ctx.moveTo(noseX, noseY);
        ctx.lineTo(noseX - 5, noseY + 10);
        ctx.lineTo(noseX + 5, noseY + 10);
        ctx.closePath();
        ctx.fill();
        break;
      case 'small':
        ctx.beginPath();
        ctx.arc(noseX, noseY + 5, 3, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'large':
        ctx.beginPath();
        ctx.moveTo(noseX, noseY - 5);
        ctx.lineTo(noseX - 8, noseY + 12);
        ctx.lineTo(noseX + 8, noseY + 12);
        ctx.closePath();
        ctx.fill();
        break;
      case 'button':
        ctx.beginPath();
        ctx.ellipse(noseX, noseY + 5, 5, 3, 0, 0, Math.PI * 2);
        ctx.fill();
        break;
    }
  };

  const drawMouth = (ctx) => {
    ctx.strokeStyle = '#d4756a';
    ctx.fillStyle = '#d4756a';
    ctx.lineWidth = 2;
    const mouthX = 150;
    const mouthY = 210;

    switch (avatar.mouthStyle) {
      case 'smile':
        ctx.beginPath();
        ctx.arc(mouthX, mouthY - 5, 20, 0.2 * Math.PI, 0.8 * Math.PI);
        ctx.stroke();
        break;
      case 'grin':
        ctx.beginPath();
        ctx.arc(mouthX, mouthY - 10, 25, 0.2 * Math.PI, 0.8 * Math.PI);
        ctx.stroke();
        ctx.fillRect(mouthX - 15, mouthY + 5, 30, 8);
        break;
      case 'neutral':
        ctx.beginPath();
        ctx.moveTo(mouthX - 15, mouthY);
        ctx.lineTo(mouthX + 15, mouthY);
        ctx.stroke();
        break;
      case 'surprised':
        ctx.beginPath();
        ctx.arc(mouthX, mouthY + 5, 12, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'laugh':
        ctx.beginPath();
        ctx.arc(mouthX, mouthY - 8, 22, 0.15 * Math.PI, 0.85 * Math.PI);
        ctx.stroke();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(mouthX - 12, mouthY + 8, 24, 6);
        break;
      case 'smirk':
        ctx.beginPath();
        ctx.moveTo(mouthX - 15, mouthY);
        ctx.quadraticCurveTo(mouthX, mouthY + 5, mouthX + 15, mouthY - 3);
        ctx.stroke();
        break;
      case 'kiss':
        ctx.fillStyle = '#ff69b4';
        ctx.beginPath();
        ctx.ellipse(mouthX, mouthY + 5, 10, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#d4756a';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(mouthX - 5, mouthY + 3);
        ctx.lineTo(mouthX - 5, mouthY + 7);
        ctx.moveTo(mouthX + 5, mouthY + 3);
        ctx.lineTo(mouthX + 5, mouthY + 7);
        ctx.stroke();
        break;
    }
  };

  const drawFacialHair = (ctx) => {
    if (avatar.facialHair === 'none') return;

    ctx.fillStyle = avatar.facialHairColor;
    ctx.strokeStyle = avatar.facialHairColor;
    ctx.lineWidth = 2;

    switch (avatar.facialHair) {
      case 'beard':
        ctx.beginPath();
        ctx.arc(150, 230, 45, 0.2 * Math.PI, 0.8 * Math.PI);
        ctx.lineTo(150, 250);
        ctx.closePath();
        ctx.fill();
        // Beard texture
        ctx.strokeStyle = avatar.facialHairColor;
        for (let i = 0; i < 8; i++) {
          ctx.beginPath();
          ctx.moveTo(120 + i * 8, 225 + Math.random() * 5);
          ctx.lineTo(120 + i * 8, 240 + Math.random() * 10);
          ctx.stroke();
        }
        break;
      case 'goatee':
        ctx.beginPath();
        ctx.ellipse(150, 235, 20, 25, 0, 0, Math.PI * 2);
        ctx.fill();
        // Mustache part
        ctx.beginPath();
        ctx.moveTo(135, 215);
        ctx.quadraticCurveTo(142, 220, 150, 220);
        ctx.quadraticCurveTo(158, 220, 165, 215);
        ctx.lineWidth = 4;
        ctx.stroke();
        break;
      case 'mustache':
        ctx.beginPath();
        ctx.moveTo(130, 215);
        ctx.quadraticCurveTo(140, 220, 150, 218);
        ctx.quadraticCurveTo(160, 220, 170, 215);
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.stroke();
        break;
      case 'stubble':
        ctx.globalAlpha = 0.3;
        for (let i = 0; i < 100; i++) {
          const x = 105 + Math.random() * 90;
          const y = 215 + Math.random() * 40;
          ctx.fillRect(x, y, 1, 1);
        }
        ctx.globalAlpha = 1;
        break;
      case 'full':
        // Full beard
        ctx.beginPath();
        ctx.ellipse(150, 215, 60, 50, 0, 0, Math.PI);
        ctx.fill();
        // Beard extension
        ctx.fillRect(110, 215, 80, 30);
        ctx.beginPath();
        ctx.arc(150, 245, 40, 0, Math.PI);
        ctx.fill();
        // Mustache
        ctx.beginPath();
        ctx.moveTo(130, 212);
        ctx.quadraticCurveTo(140, 218, 150, 216);
        ctx.quadraticCurveTo(160, 218, 170, 212);
        ctx.lineWidth = 6;
        ctx.stroke();
        break;
      case 'soul-patch':
        ctx.beginPath();
        ctx.ellipse(150, 240, 8, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'chin-strap':
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.arc(150, 220, 50, 0.3 * Math.PI, 0.7 * Math.PI);
        ctx.stroke();
        // Connect to ears
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(105, 190);
        ctx.lineTo(105, 210);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(195, 190);
        ctx.lineTo(195, 210);
        ctx.stroke();
        break;
    }
  };

  const drawGlasses = (ctx) => {
    if (avatar.glassesStyle === 'none') return;

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    const leftX = 125;
    const rightX = 175;
    const glassesY = 170;

    switch (avatar.glassesStyle) {
      case 'round':
        ctx.beginPath();
        ctx.arc(leftX, glassesY, 15, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(rightX, glassesY, 15, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(leftX + 15, glassesY);
        ctx.lineTo(rightX - 15, glassesY);
        ctx.stroke();
        break;
      case 'square':
        ctx.strokeRect(leftX - 15, glassesY - 12, 30, 24);
        ctx.strokeRect(rightX - 15, glassesY - 12, 30, 24);
        ctx.beginPath();
        ctx.moveTo(leftX + 15, glassesY);
        ctx.lineTo(rightX - 15, glassesY);
        ctx.stroke();
        break;
      case 'sunglasses':
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(leftX - 18, glassesY - 12, 36, 24);
        ctx.fillRect(rightX - 18, glassesY - 12, 36, 24);
        ctx.strokeRect(leftX - 18, glassesY - 12, 36, 24);
        ctx.strokeRect(rightX - 18, glassesY - 12, 36, 24);
        break;
      case 'aviator':
        ctx.beginPath();
        ctx.moveTo(leftX - 15, glassesY - 8);
        ctx.lineTo(leftX - 10, glassesY + 12);
        ctx.lineTo(leftX + 10, glassesY + 12);
        ctx.lineTo(leftX + 15, glassesY - 8);
        ctx.closePath();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(rightX - 15, glassesY - 8);
        ctx.lineTo(rightX - 10, glassesY + 12);
        ctx.lineTo(rightX + 10, glassesY + 12);
        ctx.lineTo(rightX + 15, glassesY - 8);
        ctx.closePath();
        ctx.stroke();
        break;
      case 'cat-eye':
        ctx.beginPath();
        ctx.moveTo(leftX - 18, glassesY);
        ctx.lineTo(leftX - 12, glassesY - 10);
        ctx.lineTo(leftX + 18, glassesY - 5);
        ctx.lineTo(leftX + 15, glassesY + 10);
        ctx.lineTo(leftX - 15, glassesY + 10);
        ctx.closePath();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(rightX + 18, glassesY);
        ctx.lineTo(rightX + 12, glassesY - 10);
        ctx.lineTo(rightX - 18, glassesY - 5);
        ctx.lineTo(rightX - 15, glassesY + 10);
        ctx.lineTo(rightX + 15, glassesY + 10);
        ctx.closePath();
        ctx.stroke();
        break;
    }
  };

  const drawClothing = (ctx) => {
    ctx.fillStyle = avatar.clothingColor;
    
    switch (avatar.clothingStyle) {
      case 'tshirt':
        ctx.beginPath();
        ctx.moveTo(100, 290);
        ctx.lineTo(135, 265);
        ctx.lineTo(165, 265);
        ctx.lineTo(200, 290);
        ctx.lineTo(200, 400);
        ctx.lineTo(100, 400);
        ctx.closePath();
        ctx.fill();
        break;
      case 'hoodie':
        ctx.beginPath();
        ctx.moveTo(95, 295);
        ctx.lineTo(130, 265);
        ctx.lineTo(170, 265);
        ctx.lineTo(205, 295);
        ctx.lineTo(205, 400);
        ctx.lineTo(95, 400);
        ctx.closePath();
        ctx.fill();
        // Hood
        ctx.beginPath();
        ctx.arc(150, 250, 35, Math.PI, 0);
        ctx.fill();
        // Drawstrings
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(140, 280);
        ctx.lineTo(135, 295);
        ctx.moveTo(160, 280);
        ctx.lineTo(165, 295);
        ctx.stroke();
        break;
      case 'shirt':
        ctx.beginPath();
        ctx.moveTo(100, 290);
        ctx.lineTo(135, 265);
        ctx.lineTo(165, 265);
        ctx.lineTo(200, 290);
        ctx.lineTo(200, 400);
        ctx.lineTo(100, 400);
        ctx.closePath();
        ctx.fill();
        // Collar
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(135, 265);
        ctx.lineTo(145, 275);
        ctx.lineTo(150, 270);
        ctx.lineTo(155, 275);
        ctx.lineTo(165, 265);
        ctx.stroke();
        break;
      case 'sweater':
        ctx.beginPath();
        ctx.moveTo(98, 288);
        ctx.lineTo(133, 263);
        ctx.lineTo(167, 263);
        ctx.lineTo(202, 288);
        ctx.lineTo(202, 400);
        ctx.lineTo(98, 400);
        ctx.closePath();
        ctx.fill();
        // Ribbed texture
        ctx.strokeStyle = 'rgba(0,0,0,0.1)';
        ctx.lineWidth = 1;
        for (let i = 275; i < 400; i += 10) {
          ctx.beginPath();
          ctx.moveTo(100, i);
          ctx.lineTo(200, i);
          ctx.stroke();
        }
        break;
      case 'vneck':
        ctx.beginPath();
        ctx.moveTo(100, 290);
        ctx.lineTo(135, 265);
        ctx.lineTo(150, 285);
        ctx.lineTo(165, 265);
        ctx.lineTo(200, 290);
        ctx.lineTo(200, 400);
        ctx.lineTo(100, 400);
        ctx.closePath();
        ctx.fill();
        break;
      case 'tanktop':
      case 'tank-top':
        ctx.beginPath();
        ctx.moveTo(120, 285);
        ctx.lineTo(140, 265);
        ctx.lineTo(160, 265);
        ctx.lineTo(180, 285);
        ctx.lineTo(180, 400);
        ctx.lineTo(120, 400);
        ctx.closePath();
        ctx.fill();
        break;
      case 'blouse':
        ctx.beginPath();
        ctx.moveTo(100, 290);
        ctx.lineTo(135, 265);
        ctx.lineTo(165, 265);
        ctx.lineTo(200, 290);
        ctx.lineTo(200, 400);
        ctx.lineTo(100, 400);
        ctx.closePath();
        ctx.fill();
        // Collar detail
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(135, 265);
        ctx.lineTo(145, 280);
        ctx.lineTo(155, 280);
        ctx.lineTo(165, 265);
        ctx.stroke();
        break;
      case 'dress':
        ctx.beginPath();
        ctx.moveTo(98, 290);
        ctx.lineTo(135, 265);
        ctx.lineTo(165, 265);
        ctx.lineTo(202, 290);
        ctx.lineTo(210, 400);
        ctx.lineTo(90, 400);
        ctx.closePath();
        ctx.fill();
        // Waist line
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(95, 320);
        ctx.lineTo(205, 320);
        ctx.stroke();
        break;
      case 'cardigan':
        ctx.beginPath();
        ctx.moveTo(95, 290);
        ctx.lineTo(130, 265);
        ctx.lineTo(170, 265);
        ctx.lineTo(205, 290);
        ctx.lineTo(205, 400);
        ctx.lineTo(95, 400);
        ctx.closePath();
        ctx.fill();
        // Button line
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(150, 270);
        ctx.lineTo(150, 395);
        ctx.stroke();
        // Buttons
        ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 4; i++) {
          ctx.beginPath();
          ctx.arc(150, 290 + i * 30, 3, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      case 'off-shoulder':
        ctx.beginPath();
        ctx.moveTo(110, 300);
        ctx.lineTo(130, 280);
        ctx.lineTo(170, 280);
        ctx.lineTo(190, 300);
        ctx.lineTo(190, 400);
        ctx.lineTo(110, 400);
        ctx.closePath();
        ctx.fill();
        break;
      case 'polo':
        ctx.beginPath();
        ctx.moveTo(100, 290);
        ctx.lineTo(135, 265);
        ctx.lineTo(165, 265);
        ctx.lineTo(200, 290);
        ctx.lineTo(200, 400);
        ctx.lineTo(100, 400);
        ctx.closePath();
        ctx.fill();
        // Collar
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(135, 265);
        ctx.lineTo(140, 275);
        ctx.lineTo(145, 270);
        ctx.moveTo(165, 265);
        ctx.lineTo(160, 275);
        ctx.lineTo(155, 270);
        ctx.stroke();
        // Buttons
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(150, 275, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(150, 285, 2, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'jacket':
        ctx.fillStyle = avatar.clothingColor;
        ctx.beginPath();
        ctx.moveTo(95, 295);
        ctx.lineTo(128, 265);
        ctx.lineTo(172, 265);
        ctx.lineTo(205, 295);
        ctx.lineTo(205, 400);
        ctx.lineTo(95, 400);
        ctx.closePath();
        ctx.fill();
        // Zipper
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(150, 270);
        ctx.lineTo(150, 400);
        ctx.stroke();
        // Collar
        ctx.fillStyle = avatar.clothingColor;
        ctx.beginPath();
        ctx.moveTo(128, 265);
        ctx.lineTo(135, 280);
        ctx.lineTo(145, 270);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(172, 265);
        ctx.lineTo(165, 280);
        ctx.lineTo(155, 270);
        ctx.closePath();
        ctx.fill();
        break;
    }
  };

  const drawAccessories = (ctx) => {
    switch (avatar.accessory) {
      case 'earrings':
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.arc(85, 195, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(215, 195, 5, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'hat':
        ctx.fillStyle = avatar.hairColor;
        ctx.fillRect(110, 100, 80, 15);
        ctx.beginPath();
        ctx.ellipse(150, 100, 45, 20, 0, Math.PI, 0, true);
        ctx.fill();
        break;
      case 'headband':
        ctx.fillStyle = avatar.clothingColor;
        ctx.fillRect(100, 135, 100, 10);
        break;
      case 'cap':
        ctx.fillStyle = avatar.clothingColor;
        ctx.beginPath();
        ctx.ellipse(150, 120, 50, 30, 0, Math.PI, 0, true);
        ctx.fill();
        ctx.fillRect(95, 120, 110, 8);
        break;
      case 'beanie':
        ctx.fillStyle = avatar.clothingColor;
        ctx.beginPath();
        ctx.ellipse(150, 120, 65, 40, 0, Math.PI, 0, true);
        ctx.fill();
        ctx.fillRect(85, 120, 130, 20);
        // Pom-pom
        ctx.beginPath();
        ctx.arc(150, 95, 8, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'flower':
        ctx.fillStyle = '#ff69b4';
        for (let i = 0; i < 5; i++) {
          ctx.beginPath();
          const angle = (i * Math.PI * 2) / 5;
          const x = 190 + Math.cos(angle) * 10;
          const y = 130 + Math.sin(angle) * 10;
          ctx.arc(x, y, 6, 0, Math.PI * 2);
          ctx.fill();
        }
        // Center
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.arc(190, 130, 4, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'bow':
        ctx.fillStyle = '#ff69b4';
        // Left bow
        ctx.beginPath();
        ctx.ellipse(170, 120, 18, 12, -0.3, 0, Math.PI * 2);
        ctx.fill();
        // Right bow
        ctx.beginPath();
        ctx.ellipse(200, 120, 18, 12, 0.3, 0, Math.PI * 2);
        ctx.fill();
        // Center knot
        ctx.beginPath();
        ctx.arc(185, 120, 8, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'tiara':
        ctx.strokeStyle = '#ffd700';
        ctx.fillStyle = '#ffd700';
        ctx.lineWidth = 3;
        // Base
        ctx.beginPath();
        ctx.arc(150, 110, 65, Math.PI, 0, true);
        ctx.stroke();
        // Points
        for (let i = 0; i < 5; i++) {
          const x = 100 + i * 25;
          ctx.beginPath();
          ctx.moveTo(x, 110);
          ctx.lineTo(x + 5, 90);
          ctx.lineTo(x + 10, 110);
          ctx.fill();
        }
        break;
      case 'hair-clip':
        ctx.fillStyle = '#ff69b4';
        ctx.fillRect(180, 130, 25, 8);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.moveTo(185 + i * 6, 132);
          ctx.lineTo(185 + i * 6, 136);
          ctx.stroke();
        }
        break;
      case 'necklace':
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(150, 260, 45, 0.3 * Math.PI, 0.7 * Math.PI);
        ctx.stroke();
        // Pendant
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.moveTo(150, 285);
        ctx.lineTo(145, 295);
        ctx.lineTo(155, 295);
        ctx.closePath();
        ctx.fill();
        break;
      case 'bandana':
        ctx.fillStyle = avatar.clothingColor;
        ctx.fillRect(95, 125, 110, 15);
        // Knot
        ctx.beginPath();
        ctx.arc(85, 132, 8, 0, Math.PI * 2);
        ctx.fill();
        break;
    }
  };

  const handleChange = (property, value) => {
    if (property === 'gender') {
      // When gender changes, reset gender-specific features to valid defaults
      const newHairStyles = value === 'female' ? femaleHairStyles : maleHairStyles;
      const newEyebrowStyles = value === 'female' ? femaleEyebrowStyles : maleEyebrowStyles;
      const newAccessories = value === 'female' ? femaleAccessories : maleAccessories;
      const newClothingStyles = value === 'female' ? femaleClothingStyles : maleClothingStyles;
      
      setAvatar(prev => ({
        ...prev,
        gender: value,
        hairStyle: newHairStyles.includes(prev.hairStyle) ? prev.hairStyle : newHairStyles[0],
        eyebrowStyle: newEyebrowStyles.includes(prev.eyebrowStyle) ? prev.eyebrowStyle : newEyebrowStyles[0],
        facialHair: value === 'female' ? 'none' : prev.facialHair,
        accessory: newAccessories.includes(prev.accessory) ? prev.accessory : newAccessories[0],
        clothingStyle: newClothingStyles.includes(prev.clothingStyle) ? prev.clothingStyle : newClothingStyles[0]
      }));
    } else {
      setAvatar(prev => ({ ...prev, [property]: value }));
    }
  };

  const randomize = () => {
    const randomGender = Math.random() > 0.5 ? 'male' : 'female';
    const hairStylesForGender = randomGender === 'female' ? femaleHairStyles : maleHairStyles;
    const eyebrowStylesForGender = randomGender === 'female' ? femaleEyebrowStyles : maleEyebrowStyles;
    const facialHairStylesForGender = randomGender === 'female' ? femaleFacialHairStyles : maleFacialHairStyles;
    const accessoriesForGender = randomGender === 'female' ? femaleAccessories : maleAccessories;
    const clothingStylesForGender = randomGender === 'female' ? femaleClothingStyles : maleClothingStyles;
    
    setAvatar({
      gender: randomGender,
      faceShape: faceShapes[Math.floor(Math.random() * faceShapes.length)],
      skinTone: skinTones[Math.floor(Math.random() * skinTones.length)].color,
      hairStyle: hairStylesForGender[Math.floor(Math.random() * hairStylesForGender.length)],
      hairColor: hairColors[Math.floor(Math.random() * hairColors.length)],
      eyeStyle: eyeStyles[Math.floor(Math.random() * eyeStyles.length)],
      eyeColor: eyeColors[Math.floor(Math.random() * eyeColors.length)],
      eyebrowStyle: eyebrowStylesForGender[Math.floor(Math.random() * eyebrowStylesForGender.length)],
      noseStyle: noseStyles[Math.floor(Math.random() * noseStyles.length)],
      mouthStyle: mouthStyles[Math.floor(Math.random() * mouthStyles.length)],
      facialHair: facialHairStylesForGender[Math.floor(Math.random() * facialHairStylesForGender.length)],
      facialHairColor: hairColors[Math.floor(Math.random() * hairColors.length)],
      glassesStyle: glassesStyles[Math.floor(Math.random() * glassesStyles.length)],
      accessory: accessoriesForGender[Math.floor(Math.random() * accessoriesForGender.length)],
      clothingStyle: clothingStylesForGender[Math.floor(Math.random() * clothingStylesForGender.length)],
      clothingColor: clothingColors[Math.floor(Math.random() * clothingColors.length)],
      backgroundStyle: backgrounds[Math.floor(Math.random() * backgrounds.length)]
    });
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    canvas.toBlob((blob) => {
      const file = new File([blob], 'avatar.png', { type: 'image/png' });
      onSave(file, avatar);
    });
  };

  const renderCategoryContent = () => {
    switch (activeCategory) {
      case 'face':
        return (
          <>
            <div className="control-group">
              <label>Gender</label>
              <div className="gender-options">
                <button
                  className={`gender-btn ${avatar.gender === 'female' ? 'active' : ''}`}
                  onClick={() => handleChange('gender', 'female')}
                >
                  <span className="gender-icon">👩</span>
                  <span className="gender-label">Female</span>
                </button>
                <button
                  className={`gender-btn ${avatar.gender === 'male' ? 'active' : ''}`}
                  onClick={() => handleChange('gender', 'male')}
                >
                  <span className="gender-icon">👨</span>
                  <span className="gender-label">Male</span>
                </button>
              </div>
            </div>
            <div className="control-group">
              <label>Face Shape</label>
              <div className="style-options">
                {faceShapes.map(shape => (
                  <button
                    key={shape}
                    className={`style-btn ${avatar.faceShape === shape ? 'active' : ''}`}
                    onClick={() => handleChange('faceShape', shape)}
                  >
                    {shape}
                  </button>
                ))}
              </div>
            </div>
            <div className="control-group">
              <label>Skin Tone</label>
              <div className="color-options">
                {skinTones.map(tone => (
                  <button
                    key={tone.color}
                    className={`color-btn ${avatar.skinTone === tone.color ? 'active' : ''}`}
                    style={{ backgroundColor: tone.color }}
                    onClick={() => handleChange('skinTone', tone.color)}
                    title={tone.name}
                  />
                ))}
              </div>
            </div>
          </>
        );
      case 'hair':
        return (
          <>
            <div className="control-group">
              <label>Hair Style</label>
              <div className="style-options">
                {getHairStyles().map(style => (
                  <button
                    key={style}
                    className={`style-btn ${avatar.hairStyle === style ? 'active' : ''}`}
                    onClick={() => handleChange('hairStyle', style)}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>
            <div className="control-group">
              <label>Hair Color</label>
              <div className="color-options">
                {hairColors.map(color => (
                  <button
                    key={color}
                    className={`color-btn ${avatar.hairColor === color ? 'active' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => handleChange('hairColor', color)}
                  />
                ))}
              </div>
            </div>
          </>
        );
      case 'eyes':
        return (
          <>
            <div className="control-group">
              <label>Eye Style</label>
              <div className="style-options">
                {eyeStyles.map(style => (
                  <button
                    key={style}
                    className={`style-btn ${avatar.eyeStyle === style ? 'active' : ''}`}
                    onClick={() => handleChange('eyeStyle', style)}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>
            <div className="control-group">
              <label>Eye Color</label>
              <div className="color-options">
                {eyeColors.map(color => (
                  <button
                    key={color}
                    className={`color-btn ${avatar.eyeColor === color ? 'active' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => handleChange('eyeColor', color)}
                  />
                ))}
              </div>
            </div>
            <div className="control-group">
              <label>Eyebrows</label>
              <div className="style-options">
                {getEyebrowStyles().map(style => (
                  <button
                    key={style}
                    className={`style-btn ${avatar.eyebrowStyle === style ? 'active' : ''}`}
                    onClick={() => handleChange('eyebrowStyle', style)}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>
          </>
        );
      case 'nose':
        return (
          <>
            <div className="control-group">
              <label>Nose</label>
              <div className="style-options">
                {noseStyles.map(style => (
                  <button
                    key={style}
                    className={`style-btn ${avatar.noseStyle === style ? 'active' : ''}`}
                    onClick={() => handleChange('noseStyle', style)}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>
            <div className="control-group">
              <label>Mouth</label>
              <div className="style-options">
                {mouthStyles.map(style => (
                  <button
                    key={style}
                    className={`style-btn ${avatar.mouthStyle === style ? 'active' : ''}`}
                    onClick={() => handleChange('mouthStyle', style)}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>
          </>
        );
      case 'facial':
        return (
          <>
            <div className="control-group">
              <label>Facial Hair Style</label>
              <div className="style-options">
                {getFacialHairStyles().map(style => (
                  <button
                    key={style}
                    className={`style-btn ${avatar.facialHair === style ? 'active' : ''}`}
                    onClick={() => handleChange('facialHair', style)}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>
            {avatar.facialHair !== 'none' && avatar.gender === 'male' && (
              <div className="control-group">
                <label>Facial Hair Color</label>
                <div className="color-options">
                  {hairColors.map(color => (
                    <button
                      key={color}
                      className={`color-btn ${avatar.facialHairColor === color ? 'active' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => handleChange('facialHairColor', color)}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        );
      case 'accessories':
        return (
          <>
            <div className="control-group">
              <label>Glasses</label>
              <div className="style-options">
                {glassesStyles.map(style => (
                  <button
                    key={style}
                    className={`style-btn ${avatar.glassesStyle === style ? 'active' : ''}`}
                    onClick={() => handleChange('glassesStyle', style)}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>
            <div className="control-group">
              <label>Accessories</label>
              <div className="style-options">
                {getAccessories().map(acc => (
                  <button
                    key={acc}
                    className={`style-btn ${avatar.accessory === acc ? 'active' : ''}`}
                    onClick={() => handleChange('accessory', acc)}
                  >
                    {acc}
                  </button>
                ))}
              </div>
            </div>
          </>
        );
      case 'clothing':
        return (
          <>
            <div className="control-group">
              <label>Clothing Style</label>
              <div className="style-options">
                {getClothingStyles().map(style => (
                  <button
                    key={style}
                    className={`style-btn ${avatar.clothingStyle === style ? 'active' : ''}`}
                    onClick={() => handleChange('clothingStyle', style)}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>
            <div className="control-group">
              <label>Clothing Color</label>
              <div className="color-options">
                {clothingColors.map(color => (
                  <button
                    key={color}
                    className={`color-btn ${avatar.clothingColor === color ? 'active' : ''}`}
                    style={{ backgroundColor: color, border: color === '#ffffff' ? '2px solid #ccc' : 'none' }}
                    onClick={() => handleChange('clothingColor', color)}
                  />
                ))}
              </div>
            </div>
          </>
        );
      case 'background':
        return (
          <div className="control-group">
            <label>Background</label>
            <div className="style-options">
              {backgrounds.map(bg => (
                <button
                  key={bg}
                  className={`style-btn ${avatar.backgroundStyle === bg ? 'active' : ''}`}
                  onClick={() => handleChange('backgroundStyle', bg)}
                >
                  {bg}
                </button>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="avatar-builder-overlay">
      <div className="avatar-builder-modal">
        <div className="avatar-builder-header">
          <h2>👻 Create Your Bitmoji</h2>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>

        <div className="avatar-builder-content">
          <div className="avatar-preview-section">
            <canvas ref={canvasRef} width="300" height="400" />
            <button className="randomize-btn" onClick={randomize}>
              🎲 Randomize
            </button>
          </div>

          <div className="avatar-controls-section">
            <div className="category-tabs">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  className={`category-tab ${activeCategory === cat.id ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat.id)}
                  title={cat.label}
                >
                  <span className="category-icon">{cat.icon}</span>
                </button>
              ))}
            </div>

            <div className="avatar-controls">
              {renderCategoryContent()}
            </div>
          </div>
        </div>

        <div className="avatar-builder-footer">
          <button className="cancel-button" onClick={onClose}>
            Cancel
          </button>
          <button className="save-button" onClick={handleSave}>
            Save Avatar
          </button>
        </div>
      </div>
    </div>
  );
};

export default AvatarBuilder;

