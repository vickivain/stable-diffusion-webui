@echo off

set PYTHON=
set GIT=
set VENV_DIR=
set PYTORCH_CUDA_ALLOC_CONF=garbage_collection_threshold:0.6,max_split_size_mb:512
set COMMANDLINE_ARGS=--xformers --no-half-vae --medvram --medvram-sdxl --no-half 
call webui.bat
