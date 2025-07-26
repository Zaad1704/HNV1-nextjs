#!/bin/bash

# Update Link imports
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' "s/import { Link } from 'react-router-dom';/import Link from 'next\/link';/g"
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' "s/import { Link, useNavigate } from 'react-router-dom';/import Link from 'next\/link';\nimport { useRouter } from 'next\/navigation';/g"
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' "s/import { useNavigate } from 'react-router-dom';/import { useRouter } from 'next\/navigation';/g"
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' "s/import { Navigate, Outlet } from 'react-router-dom';/import { redirect } from 'next\/navigation';/g"

# Update navigation calls
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' "s/const navigate = useNavigate();/const router = useRouter();/g"
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' "s/navigate(/router.push(/g"

chmod +x update-router.sh
