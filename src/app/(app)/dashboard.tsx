/*  import { FlashList } from '@shopify/flash-list';
  import React from 'react'; 

  import type { Post } from '@/api';
  import { usePosts } from '@/api';
  import { Card } from '@/components/card';
  import { EmptyList, FocusAwareStatusBar, Text, View } from '@/components/ui';

  export default function Feed() {
    const { data, isPending, isError } = usePosts();
    const renderItem = React.useCallback(
      ({ item }: { item: Post }) => <Card {...item} />,
      []
    );

    if (isError) {
      return (
        <View>
          <Text> Error Loading data </Text>
        </View>
      );
    }
    return (
      <View className="flex-1 ">
        <FocusAwareStatusBar />
        <FlashList
          data={data}
          renderItem={renderItem}
          keyExtractor={(_, index) => `item-${index}`}
          ListEmptyComponent={<EmptyList isLoading={isPending} />}
          estimatedItemSize={300}
        />
      </View>
    );
  }    

  */
import { useEffect } from 'react';

import { loadItems, saveItems } from '@/lib/storage';

export default function Dashboard() {
  useEffect(() => {
    async function testStorage() {
      await saveItems([
        {
          id: '1',
          name: 'Test',
          category: 'Demo',
          dateAdded: new Date().toISOString(),
        },
      ]);
      const all = await loadItems();
      console.log('Clutter items:', all);
    }
    testStorage();
  }, []);
  return null;
}
