# Use the official Ubuntu 20.04 image as the base image
FROM ubuntu:20.04
ARG DEBIAN_FRONTEND=noninteractive

# Set the working directory to /
WORKDIR /

# Update package lists
RUN apt-get update

# Install Python 3.10 and the required dependencies
RUN apt-get install -y software-properties-common && \
    add-apt-repository ppa:deadsnakes/ppa -y && \
    add-apt-repository universe -y

# Install Python and basic tools
RUN apt-get update && apt-get install -y \
    python3.10 \
    python3.10-dev \
    python3.10-distutils \
    python3-eventlet \
    time \
    libgl1-mesa-glx \
    curl

# Install minimal build dependencies
RUN apt-get install -y \
    build-essential \
    cmake \
    pkg-config \
    libopenblas-dev \
    liblapack-dev

# Install pip for Python 3.10 manually
RUN curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py && \
    python3.10 get-pip.py && \
    rm get-pip.py

# Install Python packages
RUN python3.10 -m pip install Flask flask-socketio

# Install numpy first (required for many packages)
RUN python3.10 -m pip install numpy

# Try to install dlib from wheel first, fallback to source if needed
RUN python3.10 -m pip install --prefer-binary dlib || \
    (apt-get install -y libx11-dev libgtk-3-dev libjpeg-dev libpng-dev libtiff-dev && \
     python3.10 -m pip install --no-cache-dir dlib==19.22)

# Install remaining packages
RUN python3.10 -m pip install \
    opencv-python \
    face_recognition \
    pyopenssl \
    websocket-server \
    websockets

# Create symbolic links to ensure Python 3.10 is used everywhere
RUN ln -sf /usr/bin/python3.10 /usr/bin/python && \
    ln -sf /usr/bin/python3.10 /usr/bin/python3 && \
    ln -sf /usr/local/bin/pip /usr/bin/pip && \
    ln -sf /usr/local/bin/pip /usr/bin/pip3

# Set environment variables to ensure Python 3.10 is default
ENV PYTHON=/usr/bin/python3.10
ENV PYTHONPATH=/usr/local/lib/python3.10/site-packages
ENV PATH="/usr/local/bin:${PATH}"

# Update alternatives to make python3.10 the default python3
RUN update-alternatives --install /usr/bin/python python /usr/bin/python3.10 1 && \
    update-alternatives --install /usr/bin/python3 python3 /usr/bin/python3.10 1

# Set the default command to run when the container starts
ADD init.bash /init.bash
RUN chmod +x /init.bash
CMD [ "bash", "-ci", "/init.bash" ]
