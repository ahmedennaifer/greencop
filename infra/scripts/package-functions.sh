#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

FUNCTION_NAME="$1"

package_function() {
    local func_name=$1
    local src_dir=$2
    local zip_file="$src_dir/function_source.zip"

    echo "Packaging $func_name..."

    if [ ! -f "$src_dir/main.py" ]; then
        echo "Error: main.py not found in $src_dir"
        exit 1
    fi

    if [ ! -f "$src_dir/requirements.txt" ]; then
        echo "Error: requirements.txt not found in $src_dir"
        exit 1
    fi

    rm -f "$zip_file"

    cd "$src_dir"
    zip -q -r function_source.zip main.py requirements.txt -x "*.pyc" -x "__pycache__/*"
    cd - > /dev/null

    if [ ! -f "$zip_file" ]; then
        echo "Error: Failed to create $zip_file"
        exit 1
    fi

    echo "Created: $zip_file"
}

if [ -z "$FUNCTION_NAME" ] || [ "$FUNCTION_NAME" = "all" ]; then
    package_function "alert-detection" "$REPO_ROOT/services/alerts"
    package_function "alert-subscriber" "$REPO_ROOT/services/alert_subscriber"
    echo "Done packaging all functions."
else
    case "$FUNCTION_NAME" in
        alert-detection)
            package_function "alert-detection" "$REPO_ROOT/services/alerts"
            ;;
        alert-subscriber)
            package_function "alert-subscriber" "$REPO_ROOT/services/alert_subscriber"
            ;;
        *)
            echo "Error: Unknown function '$FUNCTION_NAME'"
            echo "Usage: $0 [alert-detection|alert-subscriber|all]"
            exit 1
            ;;
    esac
fi
