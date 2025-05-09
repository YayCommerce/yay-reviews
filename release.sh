PLUGIN_SLUG="yay-reviews"
PROJECT_PATH=$(pwd)
RELEASE_PATH="${PROJECT_PATH}/release"
DEST_PATH="$RELEASE_PATH/$PLUGIN_SLUG"

echo "Generating build directory..."
rm -rf "$RELEASE_PATH"
mkdir -p "$DEST_PATH"

echo "Installing PHP and JS dependencies..."
cd apps/yay-reviews
npm install
echo "Running JS Build..."
npm run build
cd ../../

echo "Syncing files..."
rsync -rc --exclude-from="$PROJECT_PATH/.distignore" "$PROJECT_PATH/" "$DEST_PATH/" --delete --delete-excluded

echo "Run lint"
cd tools
composer run cbf ../release
cd ..

# STEP3 Remove Development files
sed -i "" "/'YAY_REVIEWS_IS_DEVELOPMENT', true/d" "$DEST_PATH/yay-reviews.php"
rm -rf "$DEST_PATH/includes/Engine/Register/RegisterDev.php"

echo "Generating zip file..."
cd "$RELEASE_PATH" || exit
zip -q -r "${PLUGIN_SLUG}.zip" "$PLUGIN_SLUG/"
rm -rf "$PLUGIN_SLUG"
echo "${PLUGIN_SLUG}.zip file generated!"

echo "Build done!"