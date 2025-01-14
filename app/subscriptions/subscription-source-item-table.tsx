"use client"

import { useState, useTransition } from "react"
import * as React from "react"
import { Edit2, Trash2, PlusCircle } from 'lucide-react'
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { PopupSheet } from "@/components/popup-sheet"
import { type SubscriptionSourceItem, type User, type SubscriptionSource } from "@/types"
import { IdBadge } from "@/components/id-badge"
import { DateTime } from "@/components/date-time"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CollapseDisplay } from "@/components/collapse-display"

import { deleteSubscriptionSourceItem } from "./actions"
import { SubscriptionSourceItemForm } from "./subscription-source-item-form"

interface SubscriptionSourceItemTableProps {
  items: SubscriptionSourceItem[]
  sourceId: string
  source: SubscriptionSource
  users: User[]
}

export function SubscriptionSourceItemTable({ items, sourceId, source, users }: SubscriptionSourceItemTableProps) {
  const [editingItem, setEditingItem] = useState<SubscriptionSourceItem | null>(null)
  const [deletingItem, setDeletingItem] = useState<SubscriptionSourceItem | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isPending, startTransition] = useTransition()

  function onDelete(item: SubscriptionSourceItem) {
    startTransition(async () => {
      try {
        await deleteSubscriptionSourceItem(item.id)
        toast("删除成功")
        setDeletingItem(null)
      } catch (error) {
        toast("删除失败", {
          description: (error as Error).message,
        })
      }
    })
  }

  return (
    <>
      <div className="mt-4">
        <div className="flex mb-4">
          <Button variant="outline" size="sm" onClick={() => setIsCreating(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            添加订阅源项目
          </Button>
        </div>

        <Card className="bg-muted/30">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>用户</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>最新</TableHead>
                <TableHead>更新时间</TableHead>
                <TableHead className="w-[100px]">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    暂无数据
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell><IdBadge id={item.id} /></TableCell>
                    <TableCell>{users.find(u => u.id === item.userId)?.name || '-'}</TableCell>
                    <TableCell>
                      <CollapseDisplay url={item.url} />
                    </TableCell>
                    <TableCell>{item.enable ? '启用' : '禁用'}</TableCell>
                    <TableCell>
                      <Badge variant={item.upToDate ? "success" : "destructive"}>
                        {item.upToDate ? '是' : '否'}
                      </Badge>
                    </TableCell>
                    <TableCell><DateTime date={item.updatedAt} /></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingItem(item)}
                        >
                          <Edit2 className="h-4 w-4" />
                          <span className="sr-only">编辑</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeletingItem(item)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">删除</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>

      <PopupSheet
        open={Boolean(editingItem) || isCreating}
        onOpenChange={(open) => {
          if (!open) {
            setEditingItem(null)
            setIsCreating(false)
          }
        }}
        title={editingItem ? "编辑订阅源项目" : "添加订阅源项目"}
      >
        <SubscriptionSourceItemForm
          sources={[source]}
          users={users}
          item={editingItem ?? undefined}
          onSuccess={() => {
            setEditingItem(null)
            setIsCreating(false)
          }}
        />
      </PopupSheet>

      <AlertDialog
        open={Boolean(deletingItem)}
        onOpenChange={(open) => !open && setDeletingItem(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除此订阅源项目吗？此操作不可撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletingItem) {
                  onDelete(deletingItem)
                }
              }}
              disabled={isPending}
            >
              {isPending ? "删除中..." : "删除"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
} 