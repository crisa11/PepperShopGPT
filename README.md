![Pepper Robot](architecture.jpg)

## LM: Artificial Intelligence & Robotics - HRI - RBC project
[Vincenzo Crisà](https://github.com/crisa11), [Stefano D'Urso](https://github.com/stefa350), [Fabrizio Italia](https://github.com/fabrizio-18)

Sapienza University of Rome, Italy

This repository documents the **Human-Robot Interaction (HRI)** system for _PepperShop_, a project that enables the Pepper robot to assist customers in a supermarket environment through personalized, multilingual, and socially intelligent interaction.

A video illustrating the HRI behavior can be found [here](https://www.youtube.com/watch?v=WvOOgjnjPeU)

---

## 🧠 Overview

The HRI module integrates face recognition, natural language understanding, and expressive dialogue to allow Pepper to:
- Greet and recognize users
- Respond to product-related queries (price, location, ingredients)
- Adapt language and tone based on age, profile, and preferences
- Ensure socially appropriate, ethical behavior (e.g. alcohol to minors)

Pepper interacts through speech, facial expressions, gestures, and a web-based tablet interface.

---

## 📦 System Architecture

The HRI system is modular and follows a **client-server architecture**, coordinated by **RAIM** (Rich Adaptive Interaction Manager). All modules communicate using standardized commands via IPC, HTTP, and WebSocket protocols.

### Key Components

- **RAIM Core**: Central message broker handling command dispatching and response routing.
- **PepperBot Interface**: Controls Pepper’s physical behaviors via NAOqi.
- **Face Recognition Module**: Identifies and manages user profiles.
- **Customer Interaction Module**: Handles speech input and dialogue via Azure OpenAI Assistant (GPT-4.1).
- **Web Application Module**: Multimodal user interface with voice and visual feedback.

---

## 🦾 Git Submodules

This repository includes several Git submodules, which provide reusable components essential for the HRI system. Make sure to initialize and update them after cloning the repository:

### How to initialize submodules:

```bash
git clone --recurse-submodules https://github.com/crisa11/PepperShopGPT.git
# or, if you already cloned:
git submodule update --init --recursive
```

### Included Submodules:

* [`hri_software`](https://bitbucket.org/iocchi/hri_software.git)
  Core libraries and utilities for human-robot interaction modules developed at Sapienza.

* [`pepper_tools`](https://bitbucket.org/mtlazaro/pepper_tools.git)
  Tools and APIs to interface with the Pepper robot.

* [`modim`](https://bitbucket.org/mtlazaro/modim.git)
  A lightweight framework for orchestrating multimodal robot behaviors including speech, gestures, and tablet animations.

---

## 🗣️ Interaction Flow

1. **User Detection**: Face recognition detects the user (known or unknown).
2. **User Registration** (if unknown): Pepper collects name, age, and consent for data storage.
3. **Dialogue Initiation**: Robot asks if assistance is needed.
4. **Query Handling**:
   - Simple questions: answered via hardcoded bilingual responses.
   - Complex queries: sent to GPT-4.1 with access to product database.
5. **Response Generation**:
   - Pepper speaks and animates expressively.
   - Tablet displays product info and images.
6. **Session End**: Pepper offers further help or says farewell. Data is discarded if no consent was given.

---

## 📁 Product Database Format (JSON)

Example:
```json
{
  "name": "Whole Milk",
  "image_path": "images/milk.png",
  "overage": "False",
  "category": "Dairy",
  "price": 1.49,
  "location": "Aisle 5, Shelf B2",
  "description": "Fresh whole milk from local farms",
  "ingredients": ["pasteurized whole milk"],
  "allergens": ["milk"],
  "keywords": ["milk", "dairy", "fresh"]
}
