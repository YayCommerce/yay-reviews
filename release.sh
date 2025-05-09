PLUGIN_SLUG="yay-reviews"
PROJECT_PATH=$(pwd)
BUILD_PATH="${PROJECT_PATH}/build"
DEST_PATH="$BUILD_PATH/$PLUGIN_SLUG"

echo "Generating build directory..."
rm -rf "$BUILD_PATH"
mkdir -p "$DEST_PATH"

echo "Installing PHP and JS dependencies..."
cd apps/yay-reviews
npm install
echo "Running JS Build..."
npm run build
cd ../../

echo "Syncing files..."
rsync -rc --exclude-from="$PROJECT_PATH/.distignore" "$PROJECT_PATH/" "$DEST_PATH/" --delete --delete-excluded

# wp i18n make-pot . languages/yay_reviews.pot --exclude=assets 
echo "Generating zip file..."
cd "$BUILD_PATH" || exit
zip -q -r "${PLUGIN_SLUG}.zip" "$PLUGIN_SLUG/"

cd "$PROJECT_PATH" || exit
mv "$BUILD_PATH/${PLUGIN_SLUG}.zip" "$PROJECT_PATH"
echo "${PLUGIN_SLUG}.zip file generated!"
rm -rf build
echo "Build done!"